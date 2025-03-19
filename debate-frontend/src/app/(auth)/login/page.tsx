import React, { Suspense } from 'react'
import LoginPage from './_components/Login'

function page() {
    return (
        <div className="relative min-h-screen max-h-screen flex flex-col bg-gray-100 overflow-hidden">
            <div className="absolute -top-40 left-0 w-full h-[34rem] sm:h-[30rem] bg-gradient-to-r from-orange-400 via-purple-500 to-blue-400 transform -skew-y-6" />


            <main className="relative flex items-center justify-center p-2 sm:p-6">
                <Suspense>
                    <LoginPage />
                </Suspense>
            </main>
        </div>
    )
}

export default page