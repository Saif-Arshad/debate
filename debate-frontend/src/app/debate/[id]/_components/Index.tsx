"use client"

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import DebatePage from './Chat'
import { Loader } from '@/app/dashboard/_components'

function Index({ id }: any) {
    console.log(id)
    const [loading, setLoading] = useState(true)
    const [debate, setdebate] = useState()
    console.log("🚀 ~ Index ~ debate:", debate)
    const getDebates = async (id: any) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/debate/${id}`,
            );
            setdebate(response.data.data);
        } catch (error) {
            console.error("Error fetching debates", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (id) {
            console.log("🚀 ~ useEffect ~ id:", id)
            getDebates(id)
        }
    }, [id])

    return (
        loading ? <Loader />
            :
            <DebatePage
                debate={debate}
            />
    )
}

export default Index