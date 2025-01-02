import './App.css'
import { Navbar } from './components/Navbar/Navbar.jsx'
import { LogoBienvenida } from './components/LogoBienvenida/LogoBienvenida.jsx'
import { Footer } from './components/Footer/Footer.jsx'

export function App () {
    return (
        <div class="indexDiv container">
            <Navbar />
            <LogoBienvenida />
            <Footer />
        </div>
    )
}