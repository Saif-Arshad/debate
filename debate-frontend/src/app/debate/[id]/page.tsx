import React from 'react'
import Index from './_components/Index'

interface PageProps {
    params: {
        id: string
    }
}

function Page({ params }: PageProps) {
    const { id } = params
    
    return (
        <>
            <Index id={id} />
        </>
    )
}

export default Page