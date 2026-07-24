import React, { useEffect, useState } from 'react';
import { fetchAllClasses } from '../../../../Api/apiCaller/classapicaller';
import CountUp from 'react-countup';
import './overalldetails.css'

export default function OverAllDetails() {
    const [totalClass, setTotalClass] = useState(0);
    const [totalTeacher, setTotalTeacher] = useState(0);
    const [totalStudent, setTotalStudent] = useState(0);

    useEffect(() => {
        const getTotalClass = async () => {
            try {
                const data = await fetchAllClasses();
                setTotalClass(data?.data?.totalClass || 0);
                setTotalTeacher(data?.data?.totalTeacher || 0);
                setTotalStudent(data?.data?.totalStudent || 0);

            } catch (err) {
                console.error("Error fetching classes", err);
            }
        };
        getTotalClass();
    }, []);

    // console.log(totalClass);
    // console.log(totalTeacher);
    // console.log(totalStudent);

    return (
        <div className='main-overall'>
            <div className='total'>
                <CountUp start={0}
                    end={totalClass}
                    duration={2.75}
                    enableScrollSpy={true}
                    className='counter'
                ></CountUp>
                <h4>Classes Created</h4>
            </div>
            <div className='total'>
                <CountUp start={0}
                    end={totalTeacher}
                    duration={2.75}
                    enableScrollSpy={true}
                    className='counter'
                ></CountUp>
                <h4>Teachers Joined</h4>
            </div>
            <div className='total'>
                <CountUp start={0}
                    end={totalStudent}
                    duration={2.75}
                    enableScrollSpy={true}
                    className='counter'
                ></CountUp>
                <h4>Students Enrolled</h4>
            </div>
        </div>
    );
};