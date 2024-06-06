import React, { useEffect, useState } from 'react';
import { fetchAllClasses } from '../../Api/apiCaller/classapicaller';
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
                setTotalClass(data.data.length);
                console.log(data.data)

                data.data.map((data) => {
                    setTotalTeacher((prev) => prev + data.teacher.length);
                    setTotalStudent((prev) => prev + data.student.length);
                })

            } catch (err) {
                console.error("Error fetching classes", err);
            }
        };
        getTotalClass();
    }, []);

    console.log(totalClass);
    console.log(totalTeacher);
    console.log(totalStudent);

    return (
        <div className='main-overall'>
            <div className='total'>
                <CountUp start={0}
                    end={totalClass}
                    duration={2.75}
                    enableScrollSpy={true}
                    className='counter'
                ></CountUp>
                <h4>𝒞𝓁𝒶𝓈𝓈𝑒𝓈 𝒞𝓇𝑒𝒶𝓉𝑒𝒹
                </h4>
            </div>
            <div className='total'>
                <CountUp start={0}
                    end={totalTeacher}
                    duration={2.75}
                    enableScrollSpy={true}
                    className='counter'
                ></CountUp>
                <h4>𝒯𝑒𝒶𝒸𝒽𝑒𝓇 𝒥𝑜𝒾𝓃𝑒𝒹
                </h4>
            </div>
            <div className='total'>
                <CountUp start={0}
                    end={totalStudent}
                    duration={2.75}
                    enableScrollSpy={true}
                    className='counter'
                ></CountUp>
                <h4>𝒮𝓉𝓊𝒹𝑒𝓃𝓉 𝒥𝑜𝒾𝓃𝑒𝒹
                </h4>
            </div>
        </div>
    );
};