import React, { useEffect, useState } from "react";
import { Box, useTheme, Button } from "@mui/material";
import { useContext } from 'react';
import { colorModeContext, tokens } from '../../theme';
import { Grid, Typography } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import "./Odashboard.css";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../LoginForm/config';
import { useNavigate } from 'react-router-dom'

const ODashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [numTables, setNumTables] = useState(0); // State to hold the number of dine-in tables
    const [numTakeaway, setNumTakeaway] = useState(0); // State to hold the number of takeaway tables
    const colorMode = useContext(colorModeContext);
    const auth = getAuth();
    const user = auth.currentUser;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTableData = async () => {
            if (user && user.uid) {
                try {
                    const q = query(collection(db, 'profile-info'), where('uID', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const profileData = querySnapshot.docs[0].data();
                        setNumTables(profileData.numTables || 0);
                        setNumTakeaway(profileData.numTakeaway || 0);
                    } else {
                        <Button path={"/first-setup"} element="Redirect to setup page"/>
                    }
                } catch (error) {
                    console.error('Error fetching table data:', error);
                }
            }
        };

        fetchTableData();
    }, [user, navigate]);

    const getRandomKey = (obj) => {
        const keys = Object.keys(obj);
        return keys[Math.floor(Math.random() * keys.length)];
    };

    const getRandomPastelColor = () => {
        const colorCategory = getRandomKey(colors);
        const shade = '300';
        return colors[colorCategory][shade];
    };

    const getRandomDarkPastelColor = () => {
        const colorCategory = getRandomKey(colors);
        const shade = '700';
        return colors[colorCategory][shade];
    };

    const handleTableClick = (table) => {
        console.log(`${table.type} Table ${table.index} clicked`);
        navigate(`/table/${table.index}`);
    };

    // Generate an array of table indices, including both dine-in and takeaway tables
    const tableIndices = Array.from({ length: numTables + numTakeaway }, (_, index) => ({
        index: index + 1,
        isOccupied: false,
        type: index < numTables ? 'Dine-In' : 'Takeaway',
    }));

    return (
        <Grid container spacing={2}>
            <Grid item xs={8}>
                <Grid container spacing={2}>
                    {tableIndices.map((table) => (
                        <Grid item key={table.index} xs={4}>
                            <Button
                                fullWidth
                                sx={{
                                    padding: 0,
                                    textTransform: 'none',
                                    backgroundColor: theme.palette.mode === 'dark' ? getRandomDarkPastelColor() : getRandomPastelColor(),
                                    height: 200,
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    borderRadius: 5,
                                    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                                    padding: 2,
                                    position: 'relative',
                                }}
                                className={table.isOccupied ? 'occupied' : 'vacant'}
                                onClick={() => {handleTableClick(table)}}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '1.2rem',
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        color: theme.palette.mode === 'dark' ? "white" : "dark-grey",
                                    }}
                                >
                                    {table.type} {table.index <= numTables ? table.index : table.index - numTables}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        position: 'absolute',
                                        bottom: 8,
                                        left: 8,
                                        color: theme.palette.mode === 'dark' ? "white" : "dark-grey",
                                    }}
                                >
                                    <CircleIcon
                                        sx={{
                                            color: table.isOccupied ? 'red' : 'green',
                                            mr: 1,
                                        }}
                                    />
                                    <Typography variant="body2">
                                        {table.isOccupied ? 'Occupied' : 'Vacant'}
                                    </Typography>
                                </Box>
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default ODashboard;
