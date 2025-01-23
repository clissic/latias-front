import './App.css'
// REACT ROUTER
import {BrowserRouter, Routes, Route} from 'react-router-dom'
// COMPONENTS
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop.jsx'
import { Navbar } from './components/Navbar/Navbar.jsx'
import { Bienvenida } from './components/Bienvenida/Bienvenida.jsx'
import { LogIn } from './components/LogIn/LogIn.jsx'
import { SignUp } from './components/SignUp/SignUp.jsx'
import { Footer } from './components/Footer/Footer.jsx'
import { TerYCon } from './components/TerYCon/TerYCon.jsx'
import { RecuperarPass } from './components/RecuperarPass/RecuperarPass.jsx'
import { Cursos } from './components/Cursos/Cursos.jsx'

export function App () {
    return (
        <div className="indexDiv container">
            <BrowserRouter>
                <ScrollToTop />
                <Navbar />
                    <Routes>
                        <Route path='/' element={<Bienvenida />} />
                        {/* <Route path='/instructores' element={<Instructores />} /> */}
                        <Route path='/cursos' element={<Cursos />} />
                        <Route path='/login' element={<LogIn />} />
                        <Route path='/signup' element={<SignUp />} />
                        <Route path='/recuperarPass' element={<RecuperarPass />} />
                        <Route path='/terminosycondiciones' element={<TerYCon />} />
                    </Routes>
                <Footer />
            </BrowserRouter>
        </div>
    )
}