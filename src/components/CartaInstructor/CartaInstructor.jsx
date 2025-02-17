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

  const socialMediaLinks = Object.entries(socialMedia).map(
    ([platform, url]) => (
      <a
        key={platform}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="me-2"
      >
        <i className={`bi bi-${platform} text-orange`}></i>
      </a>
    )
  );

  return (
    <div key={firstName+id} className="card h-100 cartaInstructor bg-transparent text-white">
      <div className="overflow-hidden">
        <img src={profileImage} className="card-img-top" alt={firstName + " profile pic"} />
      </div>
      <div className="card-body d-flex flex-column justify-content-between">
        <h3 className="card-title text-orange">
          {firstName} {lastName}
        </h3>
        <div className="card-text mb-2">
          <span className="badge text-bg-dark">{profession}</span>
        </div>
        <hr />
        <p>{experience}</p>
        <div className="d-flex justify-content-between">
          <p className="card-text text-center">Redes Sociales:</p>
          <div>{socialMediaLinks}</div>
        </div>
      </div>
    </div>
  );
}
