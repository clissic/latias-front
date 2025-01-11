import './App.css'
// REACT ROUTER
import {BrowserRouter, Routes, Route} from 'react-router-dom'
// COMPONENTS
import { Navbar } from './components/Navbar/Navbar.jsx'
import { Bienvenida } from './components/Bienvenida/Bienvenida.jsx'
import { LogIn } from './components/LogIn/LogIn.jsx'
import { SignUp } from './components/SignUp/SignUp.jsx'
import { Footer } from './components/Footer/Footer.jsx'

export function App () {
    return (
        <div className="indexDiv container">
            <BrowserRouter>
                <Navbar />
                    <Routes>
                        <Route path='/' element={<Bienvenida />} />
                        {/* <Route path='/instructores' element={<Instructores />} /> */}
                        {/* <Route path='/cursos' element={<Cursos />} /> */}
                        <Route path='/login' element={<LogIn />} />
                        <Route path='/signup' element={<SignUp />} />
                        {/* <Route path='/recuperarPass' element={<RecuperarPass />} /> */}
                    </Routes>
                <Footer />
            </BrowserRouter>
        </div>
    )
}