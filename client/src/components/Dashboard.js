import '../styles/Dashboard.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [workouts, setWorkouts] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        totalCalories: 0,
        totalWorkouts: 0,
        avgCaloriesPerWorkout: 0
    });
    const [exerciseName, setExerciseName] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [date, setDate] = useState('');
    const [Weight, setWeight] = useState('');
    const [intensity, setIntensity] = useState('');
    const [duration, setDuration] = useState('');
    const [calories, setCalories] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const handlePositiveChange = (setter) => (e) => {
        const value = e.target.value;
        if (value === '' || /^[+]?\d+(\.\d+)?$/.test(value)) {
          setter(value);
        }
    };

    const intensityMultiplierMap = {
        Low: 1,
        Medium: 1.5,
        High: 2
    };
    

    const exerciseOptions = [
        { "name": "General Weightlifting", "calories": 4 },
        { "name": "Powerlifting (heavy lifting, like deadlifts or squats)", "calories": 7 },
        { "name": "Bodyweight Exercises (push-ups, pull-ups, lunges, etc.)", "calories": 7 },
        { "name": "Kettlebell Workouts (swings, snatches, etc.)", "calories": 10 },
        { "name": "Resistance Band Exercises", "calories": 4 },
        { "name": "Dumbbell Exercises (bicep curls, shoulder presses)", "calories": 5 },
        { "name": "Cable Machine Workouts (tricep pulldowns, rows)", "calories": 5 },
        { "name": "Bench Press", "calories": 5 },
        { "name": "Squats (with weights)", "calories": 6 },
        { "name": "Deadlifts", "calories": 7 },
        { "name": "Circuit Training (with weights)", "calories": 8 },
        { "name": "CrossFit", "calories": 15 },
        { "name": "Battle Ropes", "calories": 8 },
        { "name": "Medicine Ball Exercises (slams, tosses)", "calories": 6 },
        { "name": "TRX Suspension Training", "calories": 7 },
        { "name": "Body Pump Class (barbell-based)", "calories": 7 },
        { "name": "Plank", "calories": 3 },
        { "name": "Crunches", "calories": 4 },
        { "name": "Sit-ups", "calories": 5 },
        { "name": "Russian Twists", "calories": 5 },
        { "name": "Mountain Climbers", "calories": 8 },
        { "name": "Leg Raises", "calories": 4 },
        { "name": "Bicycle Crunches", "calories": 6 },
        { "name": "Ab Wheel Rollouts", "calories": 5 },
        { "name": "Smith Machine Exercises (e.g., squats, bench press)", "calories": 6 },
        { "name": "Leg Press Machine", "calories": 4 },
        { "name": "Lat Pulldown Machine", "calories": 5 },
        { "name": "Seated Chest Press Machine", "calories": 5 },
        { "name": "Leg Curl Machine", "calories": 4 },
        { "name": "Shoulder Press Machine", "calories": 4 },
        { "name": "Calf Raise Machine", "calories": 3 },
        { "name": "Running", "calories": 10 },
        { "name": "Cycling", "calories": 8 },
        { "name": "Swimming", "calories": 12 },
        { "name": "Yoga", "calories": 5 },
        { "name": "Walking", "calories": 4 },
        { "name": "Jumping Jacks", "calories": 8 },
        { "name": "HIIT", "calories": 15 },
        { "name": "Rowing", "calories": 9 },
        { "name": "Strength Training", "calories": 6 },
        { "name": "Dancing", "calories": 7 },
        { "name": "Boxing", "calories": 10 },
        { "name": "Hiking", "calories": 7 },
        { "name": "Pilates", "calories": 6 },
        { "name": "Elliptical", "calories": 8 },
        { "name": "Tennis", "calories": 7 },
        { "name": "Basketball", "calories": 10 },
        { "name": "Soccer", "calories": 9 },
        { "name": "Skating", "calories": 8 },
        { "name": "Jump Rope", "calories": 12 },
        { "name": "Push-Ups", "calories": 7 },
        { "name": "Pull-Ups", "calories": 8 },
        { "name": "Squats", "calories": 6 },
        { "name": "Lunges", "calories": 6 },
        { "name": "Barbell Squats", "calories": 6 },
        { "name": "Incline Bench Press", "calories": 5 },
        { "name": "Leg Curls", "calories": 4 },
        { "name": "Hip Thrusts", "calories": 6 },
        { "name": "Cable Rows", "calories": 5 },
        { "name": "Overhead Press", "calories": 6 },
        { "name": "Running (6 mph)", "calories": 10 },
        { "name": "Treadmill Running (various speeds/incline)", "calories": 10 },
        { "name": "Cycling (moderate pace, 12-14 mph)", "calories": 8 },
        { "name": "Cycling (stationary bike, moderate effort)", "calories": 7 },
        { "name": "Swimming (moderate effort)", "calories": 12 },
        { "name": "Rowing Machine (moderate effort)", "calories": 9 },
        { "name": "Elliptical Machine", "calories": 8 },
        { "name": "Stair Climber Machine", "calories": 6 },
        { "name": "HIIT (High-Intensity Interval Training)", "calories": 15 },
        { "name": "Power Yoga (higher intensity)", "calories": 7 },
        { "name": "Pilates (general)", "calories": 6 },
        { "name": "Dynamic Stretching", "calories": 3 },
        { "name": "Tai Chi", "calories": 4 },
        { "name": "Hiking", "calories": 7 },
        { "name": "Rock Climbing", "calories": 8 },
        { "name": "Kayaking", "calories": 4 },
        { "name": "Skiing (downhill)", "calories": 6 },
        { "name": "Snowboarding", "calories": 6 },
        { "name": "Surfing", "calories": 5 },
        { "name": "Skateboarding", "calories": 6 },
        { "name": "Soccer", "calories": 9 },
        { "name": "Basketball", "calories": 10 },
        { "name": "Tennis (singles)", "calories": 7 },
        { "name": "Badminton", "calories": 6 },
        { "name": "Golf (walking and carrying clubs)", "calories": 4 },
        { "name": "Martial Arts (e.g., Karate, Judo)", "calories": 8 },
        { "name": "Boxing (sparring)", "calories": 10 },
        { "name": "Dancing (high impact)", "calories": 7 },
        { "name": "Ice Skating", "calories": 7 },
        { "name": "Table Tennis", "calories": 3 },
        { "name": "Stationary Bike (moderate)", "calories": 7 },
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('http://localhost:5000/api/dashboard', {
            
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                
                setUser(res.data.user);
                setWorkouts(res.data.user.workouts);
                axios.get('http://localhost:5000/api/dashboard/stats', {
                
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(statRes => {
                    setDashboardData(statRes.data || {
                        totalCalories: 0,
                        totalWorkouts: 0,
                        avgCaloriesPerWorkout: 0
                    });
                    const userData = res.data.user; 
                    if (userData.birth) {
                        const calculatedAge = calculateAge(userData.birth);
                        //
                    }
                    if (userData.bmiEntries && userData.bmiEntries.length > 0) {
                        // Sort entries by date descending
                        const sorted = userData.bmiEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
                        const lastEntry = sorted[0];
                        if (lastEntry.weight) {
                          setWeight(lastEntry.weight.toString()); // populate form input
                          //setHeight(lastEntry.height.toString()); 
                        }
                      }

                })
                .catch(err => console.log('Error fetching dashboard stats:', err));
            })
            .catch(err => console.log('Error fetching dashboard data:', err));
        }
    }, []);
    //age calculation
    const calculateAge = (dobString) => {
    const dob = new Date(dobString);
    const today = new Date();
  
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
  
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
  
    return age;
    };


    useEffect(() => {
        const selectedExercise = exerciseOptions.find(option => option.name === exerciseName);
        const setsNum = parseInt(sets);
        const repsNum = parseInt(reps);
        const durationNum = parseFloat(duration);
    
        if (selectedExercise && intensity && !isNaN(durationNum)) {
            const intensityMultiplierMap = {
                Low: 1,
                Medium: 1.5,
                High: 2
            };
            const intensityMultiplier = intensityMultiplierMap[intensity] || 1;
    
            const volumeMultiplier = (!isNaN(setsNum) && !isNaN(repsNum)) ? (setsNum * repsNum / 30) : 1;
    
            const calculatedCalories = selectedExercise.calories * durationNum * intensityMultiplier * volumeMultiplier;
            setCalories(Math.round(calculatedCalories));
        } else {
            setCalories(0);
        }
    }, [exerciseName, intensity, duration, sets, reps]);
    
    


    const handleAddWorkout = () => {

        // Calculate calories based on intensity and duration

        const workoutData = { exerciseName, sets, reps, Weight, date, intensity, duration, calories};
        axios.post('http://localhost:5000/api/add-workout', workoutData, {
        
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
        .then(res => {
            // Add the new workout to the state
            setWorkouts(prevWorkouts => [...prevWorkouts, workoutData]);
        
            // Fetch updated stats
            axios.get('http://localhost:5000/api/dashboard/stats', {
            
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
                .then(statRes => {
                    setDashboardData(statRes.data || {
                        totalCalories: 0,
                        totalWorkouts: 0,
                        avgCaloriesPerWorkout: 0
                    });
                })
                .catch(err => console.log('Error fetching updated stats:', err));
        
                // Reset form fields
                setExerciseName('');
                setSets('');
                setReps('');
                setWeight('');
                setDate('');
                setIntensity('');
                setDuration('');
                setCalories(0);
                setShowModal(false);
            })
            .catch(err => console.log('Error adding workout:', err));
        };
        
        

    const handleExerciseChange = (e) => {
        const selectedExercise = exerciseOptions.find(option => option.name === e.target.value);
        setExerciseName(e.target.value);
       //if (selectedExercise) {
       //     setCalories(selectedExercise.calories);
       // }
    };

    

    const calorieData = workouts.map(workout => ({
        date: new Date(workout.date).toLocaleDateString(),
        calories: workout.calories
    }));

    return (
        <div className="dashboard-main-container">
            {user ? (
                <>
                    <div className="dashboard-output-section">
                        <h1 className="dashboard-h1">Hi, {user.name}</h1>
                        <h1 className="dashboard-h1"><span>Your Workout History</span></h1> 

                        <div className="dashboard-cards">
                            <div className="dashboard-card">
                                <h2>Calories Burned Today</h2>
                                <p>{dashboardData.totalCalories ? dashboardData.totalCalories : 0} kcal</p>
                            </div>

                            <div className="dashboard-card">
                                <h2>Total Workouts Today</h2>
                                <p>{dashboardData.totalWorkouts ? dashboardData.totalWorkouts : 0}</p>
                            </div>

                            <div className="dashboard-card">
                                <h2>Average Calories Burned per Workout</h2>
                                <p>{dashboardData.avgCaloriesPerWorkout ? dashboardData.avgCaloriesPerWorkout.toFixed(2) : 0} kcal</p>
                            </div>
                        </div>

                        <button className="dashboard-button" onClick={() => setShowModal(true)}>
                            Add Your Workout
                        </button>

                        {/* Modal Window */}
                        {showModal && (
                            <div className="modal-overlay" onClick={() => setShowModal(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <h2>Add Workout</h2>
                                    <select value={exerciseName} onChange={handleExerciseChange}>
                                        <option value="">Select Exercise</option>
                                        {exerciseOptions.map((option, index) => (
                                            <option key={index} value={option.name}>
                                                {option.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Sets"
                                        value={sets}
                                        onChange={handlePositiveChange(setSets)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Reps"
                                        value={reps}
                                        onChange={handlePositiveChange(setReps)}
                                    />
                                    
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                    <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
                                        <option value="">Select Intensity</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Duration (minutes)"
                                        value={duration}
                                        onChange={handlePositiveChange(setDuration)}
                                        min='0'
                                    />
                                    <div>Calories: {calories}</div>
                                    <button className="modal-submit-button" onClick={handleAddWorkout}>Submit</button>
                                </div>
                            </div>
                        )}
                        {/* Line Chart Section */}
                        <div className="line-chart-container">
                            <h2>Calories Burned Over Time</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={calorieData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="calories" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="dashboard-workout-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Exercise</th>
                                        <th>Sets</th>
                                        <th>Reps</th>
                                        <th>Date</th>
                                        
                                        <th>Intensity</th>
                                        <th>Duration</th>
                                        <th>Calories</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workouts.map((workout, index) => (
                                        <tr key={index}>
                                            <td>{workout.exerciseName}</td>
                                            <td>{workout.sets}</td>
                                            <td>{workout.reps}</td>
                                            <td>{new Date(workout.date).toLocaleDateString()}</td>
                                            
                                            <td>{workout.intensity}</td>
                                            <td>{workout.duration}</td>
                                            <td>{workout.calories}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </>
            ) : (
                <p>Login First to Access the Dashboard</p>
            )}
        </div>
    );
};

export default Dashboard;
