export function General(user) {
    console.log(user.user);
    return (
        <div className="text-white">
            <h1>¡Bienvenido/a, {user.user.firstName}!</h1>
            <p>Estadísticas: {user.user.statistics.timeConnected} minutos conectado/a</p>
        </div>
    );
}