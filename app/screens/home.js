import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Image } from 'react-native';
import { AuthContext } from '../../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import serpApiConfig from '../../config/serpApiConfig';
import axios from 'axios';

export default function Home() {
    const navigation = useNavigation();
    const { logout, user } = useContext(AuthContext);
    const [sportsTeams, setSportsTeams] = useState([]);
    const [sportsResults, setSportsResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSportsTeams = async () => {
            try {
                if (!user?.uid) {
                    console.error('User ID is undefined. Cannot fetch sports and teams.');
                    return;
                }
                console.log('Fetching sports and teams for user ID:', user.uid);

                const teamsQuery = query(collection(db, 'sports_teams'), where('userId', '==', user.uid));
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
                            const matchInfo = `${teams[0].name} ${teams[0].score} X ${teams[1].score} ${teams[1].name}`;

                            return {
                                team: team.team,
                                sport: team.sport,
                                matchInfo,
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



    const navigateToAddTeam = () => {
        navigation.navigate('AddTeam');
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Button title="Add New Team" onPress={navigateToAddTeam} />
            <Button title="Logout" onPress={logout} />
            {sportsResults.length > 0 ? (
                <FlatList
                    data={sportsResults}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{item.sport} - {item.team}</Text>
                            <Text>{item.matchInfo}</Text>
                            {item.thumbnail1 && item.thumbnail2 && (
                                <View style={styles.teamThumbnails}>
                                    <Image source={{ uri: item.thumbnail1 }} style={styles.thumbnail} />
                                    <Text>vs</Text>
                                    <Image source={{ uri: item.thumbnail2 }} style={styles.thumbnail} />
                                </View>
                            )}
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.noTeamsText}>No sports results available.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        width: '90%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
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
