import React from 'react'
import "./bestFitJobs.css"
import LatestJobCards from '../../LatestJobCards';
import { useSelector } from 'react-redux'; 

const BestFitJobs = () => {
    const {allBestfitJobs} = useSelector(store=>store.job);
  return (
    <>
        <div className="bestfitjobs__container max-w-4xl mx-auto bg-white rounded-2xl">
            <h1 className='font-bold text-lg my-5'>Jobs that matches your profile</h1>
            <div className='grid grid-cols-3 gap-4 my-5'>
                {
                    allBestfitJobs?.length <= 0 ? <span>No Job Available</span> : allBestfitJobs?.slice(0,6).map((job) => <LatestJobCards key={job._id} job={job}/>)
                }
            </div>
        </div>
    </>
  )
}

export default BestFitJobs