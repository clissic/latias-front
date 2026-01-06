import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Ajustes.css";
import { apiService } from "../../../services/apiService";

export const Ajustes = () => {
  const { logout, user, forceLogin } = useAuth();
  const [userData, setUserData] = useState({
    ...user,
    address: user?.address || {
      street: "",
      corner: "",
      number: "",
      apt: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    }
  });
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Lista de países
  const countries = [
    "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda", "Arabia Saudita", "Argelia",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bangladesh", "Barbados",
    "Baréin", "Bélgica", "Belice", "Benín", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina",
    "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde",
    "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre", "Colombia", "Comoras",
    "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca",
    "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia",
    "Eslovenia", "España", "Estados Unidos", "Estonia", "Esuatini", "Etiopía", "Filipinas", "Finlandia",
    "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Granada", "Grecia", "Guatemala",
    "Guinea", "Guinea-Bisáu", "Guinea Ecuatorial", "Guyana", "Haití", "Honduras", "Hungría", "India",
    "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Islas Marshall", "Islas Salomón", "Israel",
    "Italia", "Jamaica", "Japón", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati",
    "Kuwait", "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein",
    "Lituania", "Luxemburgo", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta",
    "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia",
    "Montenegro", "Mozambique", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria",
    "Noruega", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palaos", "Palestina", "Panamá",
    "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia", "Portugal", "Reino Unido", "República Centroafricana",
    "República Checa", "República del Congo", "República Democrática del Congo", "República Dominicana",
    "Ruanda", "Rumania", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino", "San Vicente y las Granadinas",
    "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur",
    "Siria", "Somalia", "Sri Lanka", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suiza",
    "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", "Trinidad y Tobago",
    "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán",
    "Vanuatu", "Vaticano", "Venezuela", "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue"
  ];

  // Filtrar países según la búsqueda
  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Actualizar userData cuando user cambie
  useEffect(() => {
    if (user) {
      const address = user.address || {
        street: "",
        corner: "",
        number: "",
        apt: "",
        city: "",
        state: "",
        zipCode: "",
        country: ""
      };
      setUserData({
        ...user,
        address: address
      });
      setCountrySearch(address.country || "");
    }
  }, [user]);

  // Cerrar el desplegable cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest('.country-dropdown-container')) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setUserData({
        ...userData,
        address: {
          ...userData.address,
          [field]: value,
        },
      });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  const handleZipCodeChange = (e) => {
    const value = e.target.value;
    // Solo permitir números
    const numericValue = value.replace(/\D/g, '');
    setUserData({
      ...userData,
      address: {
        ...userData.address,
        zipCode: numericValue,
      },
    });
  };

  const handleNumberChange = (e) => {
    const value = e.target.value;
    // Solo permitir números
    const numericValue = value.replace(/\D/g, '');
    setUserData({
      ...userData,
      address: {
        ...userData.address,
        number: numericValue,
      },
    });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Preparar los datos para enviar (sin password si no se está cambiando)
      const dataToUpdate = {
        _id: user._id || user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        ci: userData.ci,
        phone: userData.phone,
        birth: userData.birth,
        address: userData.address || {},
      };

      const response = await apiService.updateUser(dataToUpdate);
      
      if (response.status === "success") {
        // Actualizar el usuario en el contexto y localStorage
        const updatedUser = { ...user, ...dataToUpdate };
        forceLogin(updatedUser);
        
        Swal.fire({
          icon: "success",
          title: "Datos actualizados",
          text: "Tus datos personales y dirección han sido actualizados correctamente.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      } else {
        throw new Error(response.msg || "Error al actualizar los datos");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un problema al actualizar los datos.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (passwords.newPassword !== passwords.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    // Validar longitud mínima de contraseña
    if (passwords.newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La contraseña debe tener al menos 6 caracteres",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.updatePassword(passwords.newPassword);
      
      if (response.status === "success") {
        // Limpiar los campos de contraseña
        setPasswords({ newPassword: "", confirmPassword: "" });
        
        Swal.fire({
          icon: "success",
          title: "Contraseña actualizada",
          text: "Tu contraseña ha sido actualizada correctamente.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      } else {
        throw new Error(response.msg || "Error al actualizar la contraseña");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un problema al actualizar la contraseña.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText === "eliminar") {
      try {
        const res = await apiService.deleteUser(user._id || user.id);
        if(res.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Cuenta eliminada",
            text: "Tu cuenta ha sido eliminada correctamente.",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          }).then(() => {
            setShowModal(false);
            logout();
            navigate("/");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.msg || "No se pudo eliminar la cuenta.",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al eliminar la cuenta.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debes escribir 'eliminar' para confirmar",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center text-white col-12 col-lg-11">
      <div className="col-12">
        <h2 className="mb-3 text-orange">Ajustes:</h2>
        <div className="div-border-color my-4"></div>
      </div>
      {/* Formulario de datos personales */}
      <Form className="d-flex justify-content-between flex-wrap gap-3 col-12" onSubmit={handleSubmit}>
        <h4 className="col-12 text-orange">Datos personales:</h4>
        <Form.Group className="col-12 col-lg-4">
          <Form.Label>Nombre</Form.Label>
          <Form.Control type="text" name="firstName" value={userData.firstName} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
          <Form.Label>Apellido</Form.Label>
          <Form.Control type="text" name="lastName" value={userData.lastName} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-3">
          <Form.Label>C.I.</Form.Label>
          <Form.Control type="number" name="ci" value={userData.ci} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={userData.email} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control type="tel" name="phone" value={userData.phone} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-3">
          <Form.Label>Fecha de nacimiento</Form.Label>
          <Form.Control type="date" name="birth" value={userData.birth} onChange={handleChange} required />
        </Form.Group>
        <small class="text-muted form-text">Es importante que los datos sean correctos ya que se utilizarán para la generación de los certificados obtenidos.</small>

        <Form.Group className="col-12">
          <div className="div-border-color my-4"></div>
        </Form.Group>

        <h4 className="col-12 text-orange">Dirección:</h4>
        {/* Primera línea: Calle, Esquina, Número, Apto/Solar */}
        <Form.Group className="col-12 address-form-group" style={{ width: "30%" }}>
            <Form.Label>Calle</Form.Label>
            <Form.Control type="text" name="address.street" value={userData.address.street} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 address-form-group" style={{ width: "30%" }}>
            <Form.Label>Esquina</Form.Label>
            <Form.Control type="text" name="address.corner" value={userData.address.corner || ""} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="col-12 address-form-group" style={{ width: "30%" }}>
            <Form.Label>Número</Form.Label>
            <Form.Control type="text" name="address.number" value={userData.address.number} onChange={handleNumberChange} required />
        </Form.Group>
        <Form.Group className="col-12 address-form-group" style={{ width: "30%" }}>
            <Form.Label>Apto / Solar</Form.Label>
            <Form.Control type="text" name="address.apt" value={userData.address.apt || ""} onChange={handleChange} />
        </Form.Group>
        {/* Segunda línea: Ciudad, Estado, Código postal, País */}
        <Form.Group className="col-12 address-form-group" style={{ width: "30%" }}>
            <Form.Label>Ciudad</Form.Label>
            <Form.Control type="text" name="address.city" value={userData.address.city} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 address-form-group" style={{ width: "30%" }}>
            <Form.Label>Estado</Form.Label>
            <Form.Control type="text" name="address.state" value={userData.address.state} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 address-form-group" style={{ width: "30%" }}>
            <Form.Label>Código postal</Form.Label>
            <Form.Control type="text" name="address.zipCode" value={userData.address.zipCode} onChange={handleZipCodeChange} required />
        </Form.Group>
        <Form.Group className="col-12 address-form-group" style={{ width: "30%" }}>
            <Form.Label>País</Form.Label>
            <div className="position-relative country-dropdown-container">
              <Form.Control
                type="text"
                name="address.country"
                value={countrySearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setCountrySearch(value);
                  setShowCountryDropdown(true);
                  // Actualizar userData.address.country en tiempo real
                  setUserData(prev => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      country: value
                    }
                  }));
                }}
                onFocus={() => {
                  setCountrySearch(userData.address.country || "");
                  setShowCountryDropdown(true);
                }}
                placeholder="Buscar país..."
                required
                autoComplete="off"
              />
              {showCountryDropdown && filteredCountries.length > 0 && (
                <div
                  className="position-absolute w-100 bg-dark border border-secondary rounded mt-1 country-dropdown"
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    top: "100%"
                  }}
                >
                  {filteredCountries.map((country) => (
                    <div
                      key={country}
                      className="country-option p-2 text-white"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevenir que onBlur se ejecute antes del onClick
                        setUserData(prev => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            country: country
                          }
                        }));
                        setCountrySearch(country);
                        setShowCountryDropdown(false);
                      }}
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}
              {showCountryDropdown && filteredCountries.length === 0 && countrySearch && (
                <div
                  className="position-absolute w-100 bg-dark border border-secondary rounded mt-1"
                  style={{
                    zIndex: 1000,
                    top: "100%"
                  }}
                >
                  <div className="p-2 text-white text-center">
                    No se encontraron países
                  </div>
                </div>
              )}
            </div>
          </Form.Group>
        {/* Tercera línea: Botón Guardar */}
        <Form.Group className="mt-3 d-flex flex-column col-12 address-form-group justify-content-end" style={{ width: "30%" }}>
          <Form.Label></Form.Label>
          <Button variant="warning" type="submit" className="col-12" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </Form.Group>
      </Form>

      <div className="div-border-color my-4 col-12"></div>

      {/* Formulario de actualización de contraseña */}
      <Form className="d-flex justify-content-between flex-wrap gap-3 col-12" onSubmit={handlePasswordSubmit}>
        <h4 className="col-12 text-orange">Cambiar contraseña:</h4>
        <Form.Group className="d-flex flex-column col-12 col-lg-4">
          <Form.Label>Nueva contraseña</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <i
              className={`bi ${showNewPassword ? "bi-eye-slash" : "bi-eye"} password-toggle-icon`}
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#6c757d",
                fontSize: "1.2rem",
                zIndex: 10
              }}
            ></i>
          </div>
        </Form.Group>
        <Form.Group className="d-flex flex-column col-12 col-lg-4">
          <Form.Label>Confirmar contraseña</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
            <i
              className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"} password-toggle-icon`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#6c757d",
                fontSize: "1.2rem",
                zIndex: 10
              }}
            ></i>
          </div>
        </Form.Group>
        <Form.Group className="mt-3 d-flex flex-column col-12 col-lg-3 justify-content-end">
            <Form.Label></Form.Label>
            <Button variant="warning" className="col-12" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Actualizando...
                </>
              ) : (
                "Actualizar"
              )}
            </Button>
        </Form.Group>
      </Form>

      <div className="div-border-color my-4"></div>

      {/* Botón de eliminación de cuenta */}
      <div className="d-flex flex-column col-12 danger-zone justify-content-center align-items-center">
        <h4>- ZONA DE PELIGRO -</h4>
        <Button variant="danger" className="mt-3 col-12 col-lg-4" onClick={() => setShowModal(true)}>Eliminar cuenta</Button>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showModal} onHide={() => setShowModal(false)} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Escribe "eliminar" para confirmar:</p>
          <Form.Control type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteAccount}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
