import React from 'react';
import {Box, Typography, Button, Container}  from "@mui/material";
import { useState } from 'react';
import { useEffect,  } from 'react';
import {getAuth} from "firebase/auth";
import {db} from '../LoginForm/config';
import {query, collection, getDocs, where } from "firebase/firestore"
import CircleIcon from '@mui/icons-material/Circle';

const KitchenTopbar = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const [restName, setRestName] = useState("");
    const [activeOrder, setActiveOrder] = useState("");
    const [demandLvl, setDemandLvl] = useState("");

    useEffect(() => {
        const fetchTableData = async () => {
            if (user && user.uid) {
                try {
                    const q = query(collection(db, 'profile-info'), where('uID', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const profileData = querySnapshot.docs[0].data();
                        setRestName(profileData.rest_name)
                        setActiveOrder("25");
                        setDemandLvl("Medium");
                    } 
                } catch (error) {
                    console.error('Error fetching table data:', error);
                }
            }
        };

        fetchTableData();
    }, [user]);


    return (
            <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2} 
            sx={{ width: '100%' }}
            >
                <Box display="flex" alignItems="left" flexDirection={"column"}>
                    <Typography variant="h2" color="textSecondary" sx={{ mr: 2 }}>
                    {restName}
                    </Typography>
                    <Typography variant="h2" color="textSecondary" sx={{ mr: 2 }}>
                    Number of Pending Orders: {activeOrder}
                    </Typography>
                    <Typography variant="h2" color="textSecondary" sx={{ mr: 2 }}>
                    Current Demand Level: {demandLvl}
                        <CircleIcon
                        sx={{
                            color: 'Yellow',
                            ml: 1,
                        }}
                        />
                    </Typography>
                </Box>
                <Box display="flex" gap={2}> 
                    <Button variant="contained">Default View</Button>
                    <Button variant="contained">Stacked View</Button>
                    <Button variant="contained">Table View</Button>
                </Box>
            </Box>
      );
}

export default KitchenTopbar;