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
 * Home screen component that displays a list of sports teams and their latest match results.
 *
 * This component fetches the user's sports teams from Firebase Firestore
 * and their corresponding match results from SerpApi.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
export default function Home() {
    const navigation = useNavigation();
    const { logout, user } = useContext(AuthContext);
    const [sportsTeams, setSportsTeams] = useState([]); // Stores the user's sports teams
    const [sportsResults, setSportsResults] = useState([]); // Stores the match results for the sports teams
    const [loading, setLoading] = useState(true); // Tracks loading state

    /**
     * Fetches the user's sports teams from the Firebase Firestore database.
     */
    useEffect(() => {
        const fetchSportsTeams = async () => {
            try {
                if (!user?.uid) {
                    console.error('User ID is undefined. Cannot fetch sports and teams.');
                    return;
                }
                console.log('Fetching sports and teams for user ID:', user.uid);

                const teamsQuery = query(
                    collection(db, 'sports_teams'),
                    where('userId', '==', user.uid)
                );

                const querySnapshot = await getDocs(teamsQuery);

                const teams = [];
                querySnapshot.forEach((doc) => {
                    teams.push(doc.data());
                });

                setSportsTeams(teams);
            } catch (error) {
                console.error('Error fetching sports and teams:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSportsTeams();
    }, [user?.uid]);

    /**
     * Fetches the latest match results for the user's sports teams using the SerpApi.
     */
    useEffect(() => {
        const fetchSportsResults = async () => {
            try {
                if (sportsTeams.length === 0) return;

                const results = await Promise.all(
                    sportsTeams.map(async (team) => {
                        const query = `${team.sport} ${team.team} latest match`;
                        const params = {
                            q: query,
                            api_key: serpApiConfig.apiKey,
                        };

                        const response = await axios.get(serpApiConfig.baseUrl, { params });

                        const sportsResults = response.data.sports_results || null;

                        if (sportsResults && sportsResults.game_spotlight && sportsResults.game_spotlight.teams) {
                            const teams = sportsResults.game_spotlight.teams;
                            const matchInfo = `${teams[0].name} ${teams[0].score} x ` +
                                                     `${teams[1].score} ${teams[1].name}`;
                            const matchScore = `${teams[0].score} x ${teams[1].score}`;

                            return {
                                team: team.team,
                                sport: team.sport,
                                matchInfo,
                                matchScore,
                                thumbnail1: teams[0]?.thumbnail,
                                thumbnail2: teams[1]?.thumbnail,
                            };
                        } else {
                            console.log(`No game spotlight or teams data for ${query}`);
                            return {
                                team: team.team,
                                sport: team.sport,
                                matchInfo: 'No match information available.',
                            };
                        }
                    })
                );

                setSportsResults(results);
            } catch (error) {
                console.error('Error fetching sports results:', error);
            }
        };

        fetchSportsResults();
    }, [sportsTeams]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Sports Update App</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {sportsResults.length > 0 ? (
                    <FlatList
                        data={sportsResults}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{item.team}</Text>
                                <Text style={styles.cardSubheader}>{item.sport}</Text>
                                {item.thumbnail1 && item.thumbnail2 && (
                                    <View style={styles.teamThumbnails}>
                                        <Image source={{ uri: item.thumbnail1 }} style={styles.thumbnail} />
                                        <Text style={styles.cardMatchscore}>{item.matchScore}</Text>
                                        <Image source={{ uri: item.thumbnail2 }} style={styles.thumbnail} />
                                    </View>
                                )}
                                <Text style={styles.cardMatchinfoContainer}>
                                    <Text style={styles.cardMatchinfo}>{item.matchInfo}</Text>
                                </Text>
                            </View>
                        )}
                    />
                ) : (
                    <Text style={styles.noTeamsText}>No sports results available.</Text>
                )}
            </View>

            {/* Footer */}
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
        backgroundColor: '#f5f5f5',
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
    cardMatchscore: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#555',
        textAlign: 'center',
    },
    cardMatchinfoContainer: {
        backgroundColor: '#f0f4ff', // Very light blue background
        paddingVertical: 4, // Add vertical padding inside the container
        paddingHorizontal: 10, // Add horizontal padding
        borderRadius: 8, // Rounded corners for the background
        alignSelf: 'center', // Center the container within the card
        marginTop: 10, // Add spacing above the element
    },
    cardMatchinfo: {
        fontSize: 14,
        color: '#333', // Darker grey for better contrast
        fontWeight: 'bold',
        textAlign: 'center',
    },
    teamThumbnails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginHorizontal: 8,
    },
    noTeamsText: {
        marginTop: 20,
        fontSize: 16,
        color: '#888',
    },
});