import { setAllBestfitJobs } from '@/redux/jobSlice'
import { BESTFIT_JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetBestfitJobs = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchAllBestfitJobs = async () => {
            try {
                const res = await axios.get(`${BESTFIT_JOB_API_END_POINT}`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setAllBestfitJobs(res.data.bestFitJobs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllBestfitJobs();
    },[])
}

export default useGetBestfitJobs