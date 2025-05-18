import '../styles/Bodyscore.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [bmiData, setBmiData] = useState([]);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [date, setDate] = useState('');
    const [bmi, setBmi] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [waist, setWaist] = useState('');
    const [neck, setNeck] = useState('');
    const [hip, setHip] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [muscleMass, setMuscleMass] = useState('');
    const [bodyscore, setBodyscore] = useState('');
    const [gender, setGender] = useState('');
    const [name, setName] = useState('')
    const [bodyData, setBodyData] = useState([]);

    const handlePositiveChange = (setter) => (e) => {
        const value = e.target.value;
        if (value === '' || /^[+]?\d+(\.\d+)?$/.test(value)) {
            setter(value);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('http://localhost:5000/api/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setUser(res.data.user);
                // If BMI entries exist in user object
                if (res.data.user.bodyEntries) {
                    setBodyData(res.data.user.bodyEntries);
                }
            })
            .catch(err => console.log('Error fetching dashboard data:', err));
        }
    }, []);
    //
    const calculateBodyScore = (bodyFat, muscleMass) => {
        if (bodyFat == null || muscleMass == null) return null;
        // Example formula — use yours
        return Math.round((muscleMass * 2) - bodyFat);
      };
      
    
    //

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('http://localhost:5000/api/dashboard', {
            
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
              setUser(res.data.user);
              //setWorkouts(res.data.user.workouts);
              axios.get('http://localhost:5000/api/dashboard/stats', {
              
                  headers: { Authorization: `Bearer ${token}` }
              })
              .then(statRes => {
                  //setDashboardData(statRes.data || {
                  //    totalCalories: 0,
                  //    totalWorkouts: 0,
                  //    avgCaloriesPerWorkout: 0
                  //});
                      const userData = res.data.user;  
                      setUser(res.data.user);
                      if (userData.name) setName(userData.name);
                      if (userData.gender) setGender(userData.gender);

                      if (userData.bmiEntries && userData.bmiEntries.length > 0) {
                        // Sort entries by date descending
                        const sorted = userData.bmiEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
                        const lastEntry = sorted[0];
                        if (lastEntry.weight) {
                          setWeight(lastEntry.weight.toString()); // populate form input
                          setHeight(lastEntry.height.toString()); 
                        }
                      }
              })
              .catch(err => console.log('Error fetching dashboard stats:', err));
          })
          .catch(err => console.log('Error fetching dashboard data:', err));
      }
    }, []);
    //
    const handleAddBodyEntry = () => {

        if (
            !date || !weight || !height || !waist || !neck ||
            bodyFat == null || muscleMass == null || bodyscore == null
        ) {
            alert("Please complete all fields and ensure valid calculations.");
            return;
        }
        const entry = {date, weight, height, waist, hip, neck, bodyFat: parseFloat(bodyFat),muscleMass: parseFloat(muscleMass), bodyscore: parseFloat(bodyscore) }; 

        axios.post('http://localhost:5000/api/body/add', entry, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => {
            setBodyData(prev => [...prev, entry]);
            setDate('');
            //setWeight('');
            //setHeight('');
            setWaist('');
            setHip('');
            setNeck('');
            setBodyFat(0);
            setMuscleMass(0);
            setBodyscore(0);
            setShowModal(false);
        })
        .catch(err => console.log('Error adding Bodydata entry:', err));
    };

    //cal
    useEffect(() => {
        const h = parseFloat(height);
        const n = parseFloat(neck);
        const w = parseFloat(waist);
        const hp = parseFloat(hip);
        const wt = parseFloat(weight);
    
        if (!gender || !h || !n || !w || !wt || (gender === 'Female' && !hp)) {
            setBodyFat('');
            setMuscleMass('');
            setBodyscore('');
            return;
        }
    
        let bodyFatPercentage;
    
        if (gender === 'Male') {
            const diff = w - n;
            if (diff <= 0) return;
    
            bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(h)) - 450;
        } else if (gender === 'Female') {
            const sum = w + hp - n;
            if (sum <= 0) return;
    
            bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(sum) + 0.22100 * Math.log10(h)) - 450;
        }
    
        if (!isFinite(bodyFatPercentage)) {
            setBodyFat('');
            setMuscleMass('');
            setBodyscore('');
            return;
        }
    
        const roundedBodyFat = +bodyFatPercentage.toFixed(2);
        const leanBodyMass = wt * (1 - roundedBodyFat / 100);
        const estimatedMuscleMass = +(leanBodyMass * 0.5).toFixed(2);
        const score = Math.round((estimatedMuscleMass * 2) - roundedBodyFat);
    
        setBodyFat(roundedBodyFat);
        setMuscleMass(estimatedMuscleMass);
        setBodyscore(score);
    }, [waist,neck, hip, weight, height, gender]);
    
    
    
//  
    
    //
    const bodyChartData = [...bodyData] // Create a shallow copy
        .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort oldest to newest
        .map(entry => ({
            // Format date for display on X-axis (e.g., 'YYYY-MM-DD' or 'MM/DD')
            date: new Date(entry.date).toLocaleDateString('en-CA'), // 'en-CA' gives YYYY-MM-DD which sorts well
            bodyscore: entry.bodyscore,
            bodyFat: entry.bodyFat
        }));


    //
    const lastbodyFat = bodyData.length > 0 ? bodyData[bodyData.length - 1].bodyFat : null;
    const lastbodyMusclemass = bodyData.length > 0 ? bodyData[bodyData.length - 1].muscleMass : null;
    const lastBodyScore = bodyData.length > 0 ? bodyData[bodyData.length - 1].bodyscore : null;
    
    const maxWeight = bmiData.length > 0
    ? Math.max(...bmiData.map(entry => parseFloat(entry.weight)))
    : null;

    return (
        <div className="dashboard-main-container">
            {user ? (
                <>
                    <h1 className="dashboard-h1">Hi, {user.name}</h1>
                    <h1 className="dashboard-h1"><span>Your Body Weight & BMI</span></h1>
                    
                    <div className="dashboard-cards">
                            <div className="dashboard-card">
                                <h2>current Body Fat</h2>
                                <p>{lastbodyFat} %</p>
                                
                            </div>

                            <div className="dashboard-card">
                                <h2>Current Muscle Mass</h2>
                                <p>{lastbodyMusclemass}%</p>
                            </div>

                            <div className="dashboard-card">
                                <h2>Current body Score</h2>
                                <p>{lastBodyScore}</p>
                            </div>
                    </div>
                
                    <button className="dashboard-button" onClick={() => setShowModal(true)}>
                        Add Entry
                    </button>

                    {showModal && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <h2>Add Entry</h2>
                                <input
                                    type="number"
                                    placeholder="Neck in cm"
                                    value={neck}
                                    onChange={handlePositiveChange(setNeck)}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="waist in cm"
                                    value={waist}
                                    onChange={handlePositiveChange(setWaist)}
                                    required
                                />
                                {gender === 'Female' && (
                                    <input
                                        type="number"
                                        placeholder="Hip in cm"
                                        value={hip}
                                        onChange={handlePositiveChange(setHip)}
                                        required
                                    />
                                )}
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                                <div>bodyFat: {bodyFat}% &emsp;Muscle Mass: {muscleMass}% &emsp;Body Score: {bodyscore}</div>
                                
                                <button className="modal-submit-button" onClick={handleAddBodyEntry}>Submit</button>
                            </div>
                        </div>
                    )}
                    <br></br>
                    <div className="charts-container">
                {/* Chart 1: Body Score */}
                <div className="chart-wrapper">
                    <h2>Body Score over Time</h2>
                     {bodyChartData.length > 0 ? (
                         <ResponsiveContainer width="100%" height={300}>
                             <LineChart data={bodyChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                {/* Adjust YAxis domain dynamically or set reasonable defaults */}
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="bodyscore" stroke="#82ca9d" name="Body Score" activeDot={{ r: 8 }}/>
                             </LineChart>
                         </ResponsiveContainer>
                    ) : <p>No data available for chart.</p>}
                </div>

                {/* Chart 2: Body Fat */}
                <div className="chart-wrapper">
                    <h2>Body Fat over Time</h2>
                     {bodyChartData.length > 0 ? (
                         <ResponsiveContainer width="100%" height={300}>
                             <LineChart data={bodyChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                {/* Adjust YAxis domain, add unit */}
                                <YAxis domain={['auto', 'auto']} unit="%"/>
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Legend />
                                <Line type="monotone" dataKey="bodyFat" stroke="#8884d8" name="Body Fat (%)" activeDot={{ r: 8 }} />
                             </LineChart>
                         </ResponsiveContainer>
                     ) : <p>No data available for chart.</p>}
                </div>
            </div>

                    <div className="dashboard-workout-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Weight (kg)</th>
                                    <th>Height (cm)</th>
                                    <th>Waist (cm)</th>
                                    <th>Neck (cm)</th>
                                    <th>Body Fat (%)</th>
                                    <th>Muscle Mass (%)</th>
                                    <th>Bodyscore</th>
                                    
                                   
                                </tr>
                            </thead>
                            <tbody>
                                {bodyData.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{new Date(entry.date).toLocaleDateString()}</td>
                                        <td>{entry.weight} Kg</td>
                                        <td>{entry.height} cm</td>
                                        <td>{entry.waist} cm</td>
                                        <td>{entry.neck} cm</td>
                                        <td>{entry.bodyFat}</td>
                                        <td>{entry.muscleMass}</td>
                                        <td>{entry.bodyscore}</td>
                                        
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <p>Login First to Access the Dashboard</p>
            )}
        </div>
    );
};

export default Dashboard;
