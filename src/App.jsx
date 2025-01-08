import './App.css'
// REACT ROUTER
import {BrowserRouter, Routes, Route} from 'react-router-dom'
// COMPONENTS
import { Navbar } from './components/Navbar/Navbar.jsx'
import { Bienvenida } from './components/Bienvenida/Bienvenida.jsx'
import { Plataforma } from './components/Plataforma/Plataforma.jsx'
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
                        <Route path='/plataforma' element={<Plataforma />} />
                    </Routes>
                <Footer />
            </BrowserRouter>
        </div>
    )
}