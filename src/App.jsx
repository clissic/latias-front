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
import { Gestoria } from './components/Gestoria/Gestoria.jsx'
import { Instructores } from './components/Instructores/Instructores.jsx'
import { CursoDetalle } from './components/CursoDetalle/CursoDetalle.jsx'
import { Dashboard } from './components/Dashboard/Dashboard.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProtectedLogin } from './components/ProtectedLogIn/ProtectedLogIn.jsx'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx'

export function App () {
    return (
        <div className='indexDiv container'>
            <AuthProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <Navbar />
                        <Routes>
                            <Route path='/' element={<Bienvenida />} />
                            <Route path='/instructores' element={<Instructores />} />
                            <Route path='/gestoria' element={<Gestoria />} />
                            <Route path='/cursos' element={<Cursos />} />
                            <Route path='/login' element={<ProtectedLogin><LogIn /></ProtectedLogin>} />
                            <Route path='/signup' element={<SignUp />} />
                            <Route path='/recuperarPass' element={<RecuperarPass />} />
                            <Route path='/terminosycondiciones' element={<TerYCon />} />
                            <Route path='/course/:id' element={<CursoDetalle />} />
                            <Route path='/course/buy/:id' element={<ProtectedRoute><CursoDetalle /></ProtectedRoute>} />
                            <Route path='/dashboard/*' element={<Dashboard />} />
                        </Routes>
                    <Footer />
                </BrowserRouter>
            </AuthProvider>
        </div>
    )
}