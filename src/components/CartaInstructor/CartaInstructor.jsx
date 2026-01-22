import "./CartaInstructor.css";

export function CartaInstructor({
  id,
  profileImage,
  firstName,
  lastName,
  profession,
  experience,
  socialMedia,
}) {

  const socialMediaLinks = socialMedia && typeof socialMedia === 'object' 
    ? Object.entries(socialMedia)
        .filter(([platform, url]) => url && url.trim() !== '') // Filtrar solo las redes sociales que tienen URL
        .map(([platform, url]) => (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="me-2"
          >
            <i className={`bi bi-${platform} text-orange`}></i>
          </a>
        ))
    : [];

  return (
    <div key={(firstName || "") + (id || "")} className="card cartaInstructor bg-transparent text-white">
      {profileImage && (
        <div className="overflow-hidden">
          <img src={profileImage} className="card-img-top" alt={(firstName || "") + " profile pic"} />
        </div>
      )}
      <div className="card-body d-flex flex-column justify-content-between">
        <h3 className="card-title text-orange">
          {firstName} {lastName}
        </h3>
        <div className="card-text mb-2">
          <span className="badge text-bg-dark text-wrap">{profession}</span>
        </div>
        {experience && <><hr /><p>{experience}</p></>}
        {socialMediaLinks.length > 0 && (
          <div className="d-flex justify-content-between">
            <p className="card-text text-center">Redes Sociales:</p>
            <div>{socialMediaLinks}</div>
          </div>
        )}
      </div>
    </div>
  );
}
