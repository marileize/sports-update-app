import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import serpApiConfig from '../../config/serpApiConfig';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * Extract scores and metadata from the sports API response.
 *
 * This function handles various sports-specific score extraction logic
 * based on the normalized sport name.
 *
 * @param {Object} response - API response containing sports results.
 * @param {string} sport - The name of the sport.
 * @returns {Object} - Extracted score and team metadata.
 */
function extractScores(response, sport) {
    const normalizedSport = sport?.toLowerCase();
    const gameSpotlight = response?.sports_results?.game_spotlight;

    // Return default values if game data is unavailable
    if (!gameSpotlight || !Array.isArray(gameSpotlight.teams) || gameSpotlight.teams.length < 2) {
        return {
            team1Score: 'N/A',
            team2Score: 'N/A',
            team1Name: 'Unknown',
            team2Name: 'Unknown',
            thumbnail1: null,
            thumbnail2: null,
        };
    }

    const teams = gameSpotlight.teams;

    // Handle soccer-specific score extraction
    if (normalizedSport === 'soccer') {
        return {
            team1Score: teams[0]?.score || 'N/A',
            team2Score: teams[1]?.score || 'N/A',
            team1Name: teams[0]?.name || 'Unknown',
            team2Name: teams[1]?.name || 'Unknown',
            thumbnail1: teams[0]?.thumbnail || null,
            thumbnail2: teams[1]?.thumbnail || null,
        };
    }

    // Handle baseball-specific score extraction
    if (normalizedSport === 'baseball') {
        return {
            team1Score: teams[0]?.score?.R || 'N/A', // "R" represents runs in baseball
            team2Score: teams[1]?.score?.R || 'N/A',
            team1Name: teams[0]?.name || 'Unknown',
            team2Name: teams[1]?.name || 'Unknown',
            thumbnail1: teams[0]?.thumbnail || null,
            thumbnail2: teams[1]?.thumbnail || null,
        };
    }

    // Handle cricket-specific score extraction
    if (normalizedSport === 'cricket') {
        return {
            team1Score: teams[0]?.score || 'N/A',
            team2Score: teams[1]?.score || 'N/A',
            team1Name: teams[0]?.name || 'Unknown',
            team2Name: teams[1]?.name || 'Unknown',
            thumbnail1: teams[0]?.thumbnail || null,
            thumbnail2: teams[1]?.thumbnail || null,
        };
    }

    // Handle hockey-specific score extraction
    if (normalizedSport === 'hockey') {
        return {
            team1Score: teams[0]?.score || 'N/A',
            team2Score: teams[1]?.score || 'N/A',
            team1Name: teams[0]?.name || 'Unknown',
            team2Name: teams[1]?.name || 'Unknown',
            thumbnail1: teams[0]?.thumbnail || null,
            thumbnail2: teams[1]?.thumbnail || null,
        };
    }

    // Handle rugby-specific score extraction
    if (normalizedSport === 'rugby') {
        return {
            team1Score: teams[0]?.score || 'N/A',
            team2Score: teams[1]?.score || 'N/A',
            team1Name: teams[0]?.name || 'Unknown',
            team2Name: teams[1]?.name || 'Unknown',
            thumbnail1: teams[0]?.thumbnail || null,
            thumbnail2: teams[1]?.thumbnail || null,
        };
    }

    // Handle basketball or other sports (fallback to .T for total score)
    return {
        team1Score: teams[0]?.score?.T || 'N/A',
        team2Score: teams[1]?.score?.T || 'N/A',
        team1Name: teams[0]?.name || 'Unknown',
        team2Name: teams[1]?.name || 'Unknown',
        thumbnail1: teams[0]?.thumbnail || null,
        thumbnail2: teams[1]?.thumbnail || null,
    };
}

/**
 * Home screen component.
 *
 * Displays the user's saved sports teams and their latest match results.
 * Includes navigation options for adding teams or logging out.
 *
 * @component
 * @returns {JSX.Element} The rendered Home screen.
 */
export default function Home() {
    const navigation = useNavigation();
    const { logout, user } = useContext(AuthContext);
    const [sportsTeams, setSportsTeams] = useState([]);
    const [sportsResults, setSportsResults] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch sports teams from Firestore
    useEffect(() => {
        const fetchSportsTeams = async () => {
            try {
                if (!user?.uid) return; // Ensure user is logged in

                const teamsQuery = query(
                    collection(db, 'sports_teams'),
                    where('userId', '==', user.uid)
                );
                const querySnapshot = await getDocs(teamsQuery);
                const teams = querySnapshot.docs.map((doc) => doc.data());
                setSportsTeams(teams);  // Update state with fetched teams
            } catch (error) {
                console.error('Error fetching sports teams:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSportsTeams();
    }, [user?.uid]);

    // Fetch sports results using SerpApi
    useEffect(() => {
        const fetchSportsResults = async () => {
            try {
                if (sportsTeams.length === 0) return; // Skip if no teams

                const results = await Promise.all(
                    sportsTeams.map(async (team) => {
                        const query = `${team.sport} ${team.team} latest match`;
                        const params = {
                            q: query,
                            api_key: serpApiConfig.apiKey,
                        };
                        const response = await axios.get(serpApiConfig.baseUrl, { params });
                        const extractedData = extractScores(response.data, team.sport);

                        return {
                            team: team.team,
                            sport: team.sport,
                            matchInfo: `${extractedData.team1Score} x ${extractedData.team2Score}`,
                            teamName1: extractedData.team1Name,
                            teamName2: extractedData.team2Name,
                            thumbnail1: extractedData.thumbnail1,
                            thumbnail2: extractedData.thumbnail2,
                            // Checks if the current sport is cricket.
                            // This is used to apply cricket-specific styles and layout logic.
                            isCricket: team.sport.toLowerCase() === 'cricket',
                        };
                    })
                );

                setSportsResults(results); // Update state with results
            } catch (error) {
                console.error('Error fetching sports results:', error);
            }
        };

        fetchSportsResults();
    }, [sportsTeams]);

    // Render loading state
    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Sports Update App</Text>
            </View>
            <View style={styles.content}>
                {sportsResults.length > 0 ? (
                    <FlatList
                        data={sportsResults}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={[styles.card, item.isCricket && styles.cricketCard]}>
                                <Text style={styles.cardTitle}>{item.team}</Text>
                                <Text style={styles.cardSubheader}>{item.sport}</Text>
                                <View style={styles.teamThumbnails}>
                                    {item.isCricket ? (
                                        <>
                                            <View style={styles.cricketTeamsContainer}>
                                                <View style={styles.cricketTeam}>
                                                    <Image source={{ uri: item.thumbnail1 }} style={styles.thumbnail} />
                                                    <Text style={styles.teamName}>{item.teamName1}</Text>
                                                </View>
                                                <View style={styles.cricketTeam}>
                                                    <Image source={{ uri: item.thumbnail2 }} style={styles.thumbnail} />
                                                    <Text style={styles.teamName}>{item.teamName2}</Text>
                                                </View>
                                            </View>
                                        </>
                                    ) : (
                                        <>
                                            <View style={styles.teamDetails}>
                                                <Image source={{ uri: item.thumbnail1 }} style={styles.thumbnail} />
                                                <Text style={styles.teamName}>{item.teamName1}</Text>
                                            </View>
                                            <Text style={styles.cardMatchinfo}>{item.matchInfo}</Text>
                                            <View style={styles.teamDetails}>
                                                <Image source={{ uri: item.thumbnail2 }} style={styles.thumbnail} />
                                                <Text style={styles.teamName}>{item.teamName2}</Text>
                                            </View>
                                        </>
                                    )}
                                </View>
                                {item.isCricket && (
                                    <Text style={styles.cricketScore}>{item.matchInfo}</Text>
                                )}
                            </View>
                        )}
                    />
                ) : (
                    <Text style={styles.noTeamsText}>No sports results available.</Text>
                )}
            </View>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('Home')}>
                    <Icon name="home-outline" size={24} color="#fff" />
                    <Text style={styles.footerText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('AddTeam')}>
                    <Icon name="plus-circle-outline" size={24} color="#fff" />
                    <Text style={styles.footerText}>New Team</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton} onPress={logout}>
                    <Icon name="logout" size={24} color="#fff" />
                    <Text style={styles.footerText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#6C63FF',
        paddingVertical: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#6C63FF',
        paddingVertical: 10,
    },
    footerButton: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#fff',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        width: '90%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cardSubheader: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
    teamThumbnails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly', // Ensure equal spacing
        width: '100%',
        marginTop: 8,
        paddingHorizontal: 16,
    },
    teamDetails: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1, // Equal width for both team sections
        maxWidth: '40%', // Limit width to prevent overflow
    },
    cardMatchinfo: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        textAlign: 'center',
        marginHorizontal: 16,
    },
    cricketCard: {
        borderColor: '#FFD700',
        borderWidth: 1,
    },
    cricketScore: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        textAlign: 'center',
        marginHorizontal: 16,
    },
    cricketTeamsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
        width: '100%',
    },
    cricketTeam: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 4,
    },
    teamName: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
    },
});