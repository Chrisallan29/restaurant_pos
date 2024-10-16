import { Box, Icon, IconButton, useTheme} from '@mui/material';
import InputBase from '@mui/material/InputBase';
import { useContext, useState, useEffect } from 'react';
import { colorModeContext, tokens } from '../../theme';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import logo from '../../components/logo.png';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useNavigate, Link } from 'react-router-dom';
import {db} from '../LoginForm/config';
import { getAuth } from 'firebase/auth';
import {query, where, collection, getDocs, doc, onSnapshot} from 'firebase/firestore';
import SettingsMenu from './SettingsMenu';

const Topbar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(colorModeContext);
    const [totalTables, setTotalTables] = useState(0);
    const [dineIn, setDineIn] = useState(0);
    const [takeAway, setTakeAway] = useState(0);
    const [restName, setRestName] = useState("");
    const history = useNavigate();
    const auth = getAuth();
    const user = auth.currentUser;

    const handleFirstSetup = async () => {
        history("/first-setup")
    }

    useEffect(() => {
        const fetchTableData = async () => {
            if (user && user.uid) {
                try {
                    const q = query(collection(db, 'profile-info'), where('uID', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const profileData = querySnapshot.docs[0].data();
                        setRestName(profileData.rest_name)
                        setDineIn(profileData.numTables);
                        setTakeAway(profileData.numTakeaway);
                        setTotalTables(profileData.numTables + profileData.numTakeaway);
                    } 
                } catch (error) {
                    console.error('Error fetching table data:', error);
                }
            }
        };

        fetchTableData();
    }, [user]);

    // useEffect(() => {
    //     const unsubscribe = onSnapshot(doc(db, 'profile-info', user.uid), (doc) => {
    //       const profileData = doc.data();
    //       setRestName(profileData.rest_name);
    //       setDineIn(profileData.numTables);
    //       setTakeAway(profileData.numTakeaway);
    //       setTotalTables(profileData.numTables + profileData.numTakeaway);
    //     }, (error) => {
    //       console.error("Error fetching table data:", error);
    //     });
      
    //     return unsubscribe; // Function to unsubscribe on component unmount
    //   }, [user]); // Dependency on user object

    return (
        <Box display="flex" p={2} justifyContent="space-between">
            <Box display="flex" alignItems="normal">
                <Typography variant="h5" sx={{ marginRight: 2}}>
                    {restName}
                </Typography>
                <Typography variant="h5" color="textSecondary" sx={{mr:2}}>
                    Total Tables: {totalTables}
                </Typography>
                <Typography variant="h5" color="textSecondary" sx={{mr:2}}> 
                    Dine-In: {dineIn}
                </Typography>   
                <Typography variant="h5" color="textSecondary" sx={{mr:2}}> 
                    Takeaway: {takeAway}
                </Typography>
                <Typography variant="h5" color="textSecondary" sx={{mr:2}}>
                    Current View: Table Dashboard View
                </Typography>
            </Box>
            <Box display="flex" alignContent="center">
            </Box>
            <Box display="flex" backgroundColor={colors.primary[200]} borderRadius="3px">
                <InputBase sx={{ml:2, flex:1}} placeholder='Search'/>
                <IconButton >
                    <SearchIcon />
                </IconButton>
            </Box>

            <Box display="flex">
                <SettingsMenu/>
                <IconButton onClick={colorMode.toggleColorMode}>
                    {theme.palette.mode === "dark" ? (
                        <ModeNightIcon />
                    ) : (
                        <Brightness7Icon />
                    )}
                </IconButton>
                <IconButton onClick={handleFirstSetup}>
                    <PersonIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default Topbar;
