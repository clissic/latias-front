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
import { MercadoPagoPayment } from './components/MercadoPagoPayment/MercadoPagoPayment.jsx'
import { PaymentSuccess } from './components/PaymentSuccess/PaymentSuccess.jsx'
import { Dashboard } from './components/Dashboard/Dashboard.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProtectedLogin } from './components/ProtectedLogIn/ProtectedLogIn.jsx'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx'
import { ProtectedCheckinRoute } from './components/ProtectedCheckinRoute/ProtectedCheckinRoute.jsx'
import { CheckinRedirect } from './components/CheckinRedirect/CheckinRedirect.jsx'
import { ResetPassword  } from './components/ResetPass/ResetPass.jsx'
import { VerifyTicket } from './components/VerifyTicket/VerifyTicket.jsx'
import { Checkin } from './components/Checkin/Checkin.jsx'

export function App () {
    return (
        <div className='indexDiv container'>
            <AuthProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <Navbar />
                        <Routes>
                            <Route path="/checkin" element={<ProtectedCheckinRoute><Checkin /></ProtectedCheckinRoute>} />
                            <Route path='/' element={<CheckinRedirect><Bienvenida /></CheckinRedirect>} />
                            <Route path='/instructores' element={<CheckinRedirect><Instructores /></CheckinRedirect>} />
                            <Route path='/gestoria' element={<CheckinRedirect><Gestoria /></CheckinRedirect>} />
                            <Route path='/cursos' element={<CheckinRedirect><Cursos /></CheckinRedirect>} />
                            <Route path='/login' element={<ProtectedLogin><LogIn /></ProtectedLogin>} />
                            <Route path='/signup' element={<CheckinRedirect><SignUp /></CheckinRedirect>} />
                            <Route path='/recuperarPass' element={<CheckinRedirect><RecuperarPass /></CheckinRedirect>} />
                            <Route path='/terminosycondiciones' element={<CheckinRedirect><TerYCon /></CheckinRedirect>} />
                            <Route path='/course/:courseId' element={<CheckinRedirect><CursoDetalle /></CheckinRedirect>} />
                            <Route path='/course/buy/:courseId' element={<ProtectedRoute><CheckinRedirect><MercadoPagoPayment /></CheckinRedirect></ProtectedRoute>} />
                            <Route path='/payment/success' element={<ProtectedRoute><CheckinRedirect><PaymentSuccess /></CheckinRedirect></ProtectedRoute>} />
                            <Route path='/dashboard/*' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/reset-password" element={<CheckinRedirect><ResetPassword /></CheckinRedirect>} />
                            <Route path="/verify-ticket/:ticketId" element={<CheckinRedirect><VerifyTicket /></CheckinRedirect>} />
                        </Routes>
                    <Footer />
                </BrowserRouter>
            </AuthProvider>
        </div>
    )
}