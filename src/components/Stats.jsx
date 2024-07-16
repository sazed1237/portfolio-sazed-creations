import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { projects } from './Projects';
import { skills } from '../Page/Resume/Resume';
import axios from 'axios';


// Replace with your GitHub username and token
const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME;
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// console.log(GITHUB_USERNAME)

const Stats = () => {

    const [commitCount, setCommitCount] = useState(0)


    useEffect(() => {
        const fetchCommits = async () => {

            try {
                const repos = await fetchAllRepositories();

                const commitCountPromises = repos.map(repo => {
                    return axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/commits?per_page=1`, {
                        headers: {
                            Authorization: `token ${GITHUB_TOKEN}`
                        }
                    }).then(response => {
                        const commitCount = response.headers['link']
                            ? parseInt(response.headers['link'].match(/&page=(\d+)>; rel="last"/)[1])
                            : response.data.length;
                        return commitCount;
                    }).catch(error => {
                        console.error(`Error fetching commits for ${repo.name}:`, error);
                        return 0;
                    });
                });

                const commitCounts = await Promise.all(commitCountPromises);
                const totalCommits = commitCounts.reduce((acc, count) => acc + count, 0);

                setCommitCount(totalCommits);
            } catch (error) {
                console.error('Error fetching repositories:', error);
            }



            // try {
            //     const allRepos = await fetchAllRepositories()
            //     console.log("All Repos", allRepos)


            //     let totalCommits = 0;
            //     for (const repo of allRepos) {
            //         try {
            //             const commitsResponse = await fetchAllCommits(repo?.name);
            //             totalCommits += commitsResponse.length;
            //         } catch (commitError) {
            //             console.error(`Error fetching commits for ${repo?.name}:`, commitError);
            //         }
            //     }
            //     console.log("total commits", totalCommits)
            //     setCommitCount(totalCommits);
            // } catch (error) {
            //     console.error('Error fetching repositories:', error);
            // }
        };

        fetchCommits();

    }, [commitCount]);



    // all Repositories fetching
    const fetchAllRepositories = async () => {
        let page = 1;
        let allRepos = [];

        while (true) {
            const reposResponse = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`
                },
                params: {
                    per_page: 100,
                    page: page,
                }
            });

            if (reposResponse.data.length === 0) {
                break;
            }

            allRepos = allRepos.concat(reposResponse.data);
            page += 1

        }
        // console.log('all repositories', allRepos)

        return allRepos;
    }



    // all commits fetching
    // const fetchAllCommits = async (repoName) => {
    //     let commits = [];
    //     let page = 1;
    //     while (true) {
    //         const response = await axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/commits`, {
    //             headers: {
    //                 Authorization: `token ${GITHUB_TOKEN}`
    //             },
    //             params: {
    //                 per_page: 100,
    //                 page: page,
    //             }
    //         });
    //         if (response.data.length === 0) break;
    //         commits = commits.concat(response.data);
    //         page += 1;
    //     }
    //     return commits;
    // };



    const statsItems = [
        {
            num: 2,
            text: "Years of experience",
        },
        {
            num: projects.length,
            text: "Projects completed",
        },
        {
            num: skills.skillsList.length,
            text: "Technologies mastered",
        },
        {
            num: commitCount,
            text: "Code commits",
        },
    ]


    return (
        <section className='pt-4 pb-12 lg:pt-0 '>
            <div className='container mx-auto'>
                <div className='flex flex-wrap gap-6 max-w-[80vw] mx-auto lg:max-w-none'>
                    {
                        statsItems.map((stats, index) => {
                            return (
                                <div key={index} className='flex-1 flex gap-4 items-center justify-center lg:justify-start'>
                                    <CountUp
                                        end={stats.num}
                                        duration={5}
                                        delay={2}
                                        className='text-4xl lg:text-6xl font-extrabold'
                                    />
                                    <p className={`${stats.text.length < 15 ? "max-w-[100px]" : "max-w-[150px]"} leading-snug text-white/80 `}>{stats.text}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </section>
    );
};

export default Stats;