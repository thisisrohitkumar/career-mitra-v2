import { setAllRecommJobs } from '@/redux/jobSlice'
import { RECOMM_JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetRecommJobs = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchRecommJobs = async () => {
            try {
                const res = await axios.get(`${RECOMM_JOB_API_END_POINT}`,{withCredentials:true});
                console.log(res)
                if(res.data.success){
                    dispatch(setAllRecommJobs(res.data.matchingJobs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchRecommJobs();
    },[])
}

export default useGetRecommJobs