"use server"

import axios from "axios"

export const getDebateById = async(id:any)=>{
try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/debate/${id}`)
    return { data: res.data, error: null }
} catch (error) {
    return { data: null, error: error }
}

}