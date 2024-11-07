import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetRecommJobs from '@/hooks/useGetRecommJobs';

// const randomJobs = [1, 2,45];

const Browse = () => {
    useGetRecommJobs();
    const {allRecommJobs} = useSelector(store=>store.job);
    const dispatch = useDispatch();
    // useEffect(()=>{
    //     return ()=>{
    //         dispatch(setSearchedQuery(""));
    //     }
    // },[])
    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto my-10'>
                <h1 className='font-bold text-xl my-10'>Search Results ({allRecommJobs?.length})</h1>
                <div className='grid grid-cols-3 gap-4'>
                    {
                        allRecommJobs?.map((job) => {
                            return (
                                <Job key={job._id} job={job}/>
                            )
                        })
                    }
                </div>

            </div>
        </div>
    )
}

export default Browse