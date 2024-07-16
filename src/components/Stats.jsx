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
                const reposResponse = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
                    headers: {
                        Authorization: `token ${GITHUB_TOKEN}`
                    }
                });
                const repos = reposResponse.data;
                console.log("repos", repos)


                let totalCommits = 0;
                for (const repo of repos) {
                    try {
                        const commitsResponse = await fetchAllCommits(repo.name);
                        totalCommits += commitsResponse.length;
                    } catch (commitError) {
                        console.error(`Error fetching commits for ${repo.name}:`, commitError);
                    }
                }
                console.log("total commits", totalCommits)
                setCommitCount(totalCommits);
            } catch (error) {
                console.error('Error fetching repositories:', error);
            }
        };

        const fetchAllCommits = async (repoName) => {
            let commits = [];
            let page = 1;
            while (true) {
                const response = await axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/commits`, {
                    headers: {
                        Authorization: `token ${GITHUB_TOKEN}`
                    },
                    params: {
                        per_page: 100,
                        page: page,
                    }
                });
                if (response.data.length === 0) break;
                commits = commits.concat(response.data);
                page += 1;
            }
            return commits;
        };

        fetchCommits();
    }, [commitCount]);

    console.log(commitCount)

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