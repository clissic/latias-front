import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Pagination, Modal, Form, Button } from "react-bootstrap";
import { FadeIn } from "../../FadeIn/FadeIn";
import { apiService } from "../../../services/apiService";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import "../General/General.css";
import "./Flota.css";

// Componente helper para renderizar emojis con Twemoji (cargado desde CDN)
const TwemojiFlag = ({ emoji, className = "" }) => {
  const flagRef = useRef(null);

  useEffect(() => {
    if (flagRef.current && emoji && window.twemoji) {
      window.twemoji.parse(flagRef.current, {
        folder: 'svg',
        ext: '.svg',
        className: `twemoji-flag ${className}`,
        size: '36x36'
      });
    }
  }, [emoji, className]);

  return <span ref={flagRef} className={className}>{emoji}</span>;
};

// Función helper para obtener país por código
const getCountryByCode = (code) => {
  return countries.find(country => country.code === code) || null;
};

// Componente para mostrar bandera del país con tooltip
const CountryFlag = ({ countryCode, className = "" }) => {
  const flagRef = useRef(null);
  const country = getCountryByCode(countryCode);

  useEffect(() => {
    if (flagRef.current && country && window.twemoji) {
      window.twemoji.parse(flagRef.current, {
        folder: 'svg',
        ext: '.svg',
        className: `twemoji-flag ${className}`,
        size: '36x36'
      });
    }
  }, [countryCode, country, className]);

  if (!country) {
    return <span className={className}>{countryCode}</span>;
  }

  return (
    <span
      ref={flagRef}
      className={`country-flag-display ${className}`}
      data-bs-toggle="tooltip"
      data-bs-placement="top"
      data-bs-title={country.name}
      title={country.name}
    >
      {country.flag}
    </span>
  );
};

// Lista de países con sus códigos ISO y emojis de banderas
const countries = [
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "GY", name: "Guyana", flag: "🇬🇾" },
  { code: "SR", name: "Surinam", flag: "🇸🇷" },
  { code: "GF", name: "Guayana Francesa", flag: "🇬🇫" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "CA", name: "Canadá", flag: "🇨🇦" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲" },
  { code: "HT", name: "Haití", flag: "🇭🇹" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸" },
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "BZ", name: "Belice", flag: "🇧🇿" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "FR", name: "Francia", flag: "🇫🇷" },
  { code: "IT", name: "Italia", flag: "🇮🇹" },
  { code: "DE", name: "Alemania", flag: "🇩🇪" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧" },
  { code: "NL", name: "Países Bajos", flag: "🇳🇱" },
  { code: "BE", name: "Bélgica", flag: "🇧🇪" },
  { code: "GR", name: "Grecia", flag: "🇬🇷" },
  { code: "TR", name: "Turquía", flag: "🇹🇷" },
  { code: "RU", name: "Rusia", flag: "🇷🇺" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "JP", name: "Japón", flag: "🇯🇵" },
  { code: "KR", name: "Corea del Sur", flag: "🇰🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "Nueva Zelanda", flag: "🇳🇿" },
  { code: "ZA", name: "Sudáfrica", flag: "🇿🇦" },
  { code: "EG", name: "Egipto", flag: "🇪🇬" },
  { code: "MA", name: "Marruecos", flag: "🇲🇦" },
  { code: "AE", name: "Emiratos Árabes Unidos", flag: "🇦🇪" },
  { code: "SA", name: "Arabia Saudí", flag: "🇸🇦" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "TH", name: "Tailandia", flag: "🇹🇭" },
  { code: "SG", name: "Singapur", flag: "🇸🇬" },
  { code: "MY", name: "Malasia", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", name: "Filipinas", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
];

export function Flota() {
  const { user } = useAuth();
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [certificatesCount, setCertificatesCount] = useState({});
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [boatCertificates, setBoatCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const flotaListRef = useRef(null);
  const flotaCertificadosSectionRef = useRef(null);
  const boatsPerPage = 4;
  const [filterRegistro, setFilterRegistro] = useState("");
  const [filterBandera, setFilterBandera] = useState("");
  const [filterBanderaSearch, setFilterBanderaSearch] = useState("Todas");
  const [showBanderaFilterDropdown, setShowBanderaFilterDropdown] = useState(false);
  const [filterPuertoReg, setFilterPuertoReg] = useState("");
  const [filterUbicacion, setFilterUbicacion] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterEslora, setFilterEslora] = useState("");
  const [filterManga, setFilterManga] = useState("");
  const [filterPuntal, setFilterPuntal] = useState("");
  const [filterDesplazamiento, setFilterDesplazamiento] = useState("");
  const [boatTypes, setBoatTypes] = useState([]);
  const [currentCertPage, setCurrentCertPage] = useState(1);
  const certsPerPage = 2;
  const [submittingCertificate, setSubmittingCertificate] = useState(false);
  const [certificatePdfFile, setCertificatePdfFile] = useState(null);
  const [editingCertificateId, setEditingCertificateId] = useState(null);
  const [showCertificateTypeModal, setShowCertificateTypeModal] = useState(false);
  const [certificateForRequest, setCertificateForRequest] = useState(null);
  const [selectedRequestTypes, setSelectedRequestTypes] = useState([]);
  const [certificateRequestNotes, setCertificateRequestNotes] = useState("");
  const [submittingCertificateRequest, setSubmittingCertificateRequest] = useState(false);
  const [certificateFormData, setCertificateFormData] = useState({
    certificateType: "",
    number: "",
    issueDate: "",
    expirationDate: "",
    annualInspection: "no_realizada",
    observations: "",
    pdfFile: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    registrationCountry: "",
    registrationPort: "",
    currentPort: "",
    boatType: "",
    lengthOverall: "",
    beam: "",
    depth: "",
    displacement: "",
    image: "",
  });

  useEffect(() => {
    loadFleet();
  }, []);

  useEffect(() => {
    const loadBoatTypes = async () => {
      try {
        const res = await apiService.getBoatTypes();
        if (res.status === "success" && Array.isArray(res.payload)) {
          setBoatTypes(res.payload);
        }
      } catch (err) {
        console.error("Error al cargar tipos de barco:", err);
      }
    };
    loadBoatTypes();
  }, []);

  // Inicializar tooltips de Bootstrap 5
  useEffect(() => {
    const initTooltips = () => {
      if (window.bootstrap && window.bootstrap.Tooltip) {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => {
          // Verificar si ya tiene un tooltip inicializado y eliminarlo
          const existingTooltip = window.bootstrap.Tooltip.getInstance(tooltipTriggerEl);
          if (existingTooltip) {
            existingTooltip.dispose();
          }
          return new window.bootstrap.Tooltip(tooltipTriggerEl);
        });
        
        return () => {
          tooltipList.forEach(tooltip => {
            if (tooltip && typeof tooltip.dispose === 'function') {
              tooltip.dispose();
            }
          });
        };
      }
    };

    // Pequeño delay para asegurar que el DOM esté actualizado
    const timeoutId = setTimeout(() => {
      initTooltips();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      // Limpiar tooltips al desmontar
      if (window.bootstrap && window.bootstrap.Tooltip) {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(el => {
          const tooltip = window.bootstrap.Tooltip.getInstance(el);
          if (tooltip) {
            tooltip.dispose();
          }
        });
      }
    };
  }, [fleet, selectedBoat]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest('.position-relative')) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  // Cerrar dropdown de filtro bandera al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBanderaFilterDropdown && !event.target.closest('.flota-filter-bandera-wrap')) {
        setShowBanderaFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBanderaFilterDropdown]);

  const loadFleet = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserFleet();
      if (response.status === "success" && response.payload) {
        setFleet(response.payload);
        
        // Cargar cantidad de certificados para cada barco
        const certificatesData = {};
        const promises = response.payload.map(async (fleetItem) => {
          const boat = fleetItem.boatId;
          const boatId = boat?._id || boat || fleetItem._id;
          if (boatId) {
            try {
              const certResponse = await apiService.getCertificatesByBoat(boatId);
              if (certResponse.status === "success" && certResponse.payload) {
                const count = Array.isArray(certResponse.payload) 
                  ? certResponse.payload.length 
                  : 0;
                // Guardar con múltiples claves para asegurar que se encuentre
                certificatesData[boatId] = count;
                if (boat?._id) certificatesData[boat._id] = count;
                if (fleetItem._id) certificatesData[fleetItem._id] = count;
              } else {
                certificatesData[boatId] = 0;
              }
            } catch (error) {
              console.error(`Error al cargar certificados para barco ${boatId}:`, error);
              certificatesData[boatId] = 0;
            }
          }
        });
        
        await Promise.all(promises);
        setCertificatesCount(certificatesData);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.msg || "No se pudo cargar tu flota",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } catch (err) {
      console.error("Error al cargar flota:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al cargar tu flota",
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

  const handleOpenAddForm = () => {
    setShowAddForm(true);
    // Resetear formulario
    setFormData({
      name: "",
      registrationNumber: "",
      registrationCountry: "",
      registrationPort: "",
      currentPort: "",
      boatType: "",
      lengthOverall: "",
      beam: "",
      depth: "",
      displacement: "",
      image: "",
    });
    setCountrySearch("");
    setShowCountryDropdown(false);
    setImageFile(null);
    setImagePreview("");
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setFormData({
      name: "",
      registrationNumber: "",
      registrationCountry: "",
      registrationPort: "",
      currentPort: "",
      boatType: "",
      lengthOverall: "",
      beam: "",
      depth: "",
      displacement: "",
      image: "",
    });
    setCountrySearch("");
    setShowCountryDropdown(false);
    setImageFile(null);
    setImagePreview("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCountrySearch = (e) => {
    const value = e.target.value;
    setCountrySearch(value);
    setShowCountryDropdown(true);
    
    // Si el usuario borra todo, limpiar también el código del país
    if (!value.trim()) {
      setFormData(prev => ({
        ...prev,
        registrationCountry: ""
      }));
    }
  };

  const handleCountrySelect = (country) => {
    setFormData(prev => ({
      ...prev,
      registrationCountry: country.code
    }));
    setCountrySearch(`${country.flag} ${country.name} (${country.code})`);
    setShowCountryDropdown(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor selecciona un archivo de imagen válido",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "La imagen no debe superar los 5MB",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
        return;
      }

      // Guardar el archivo
      setImageFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({
      ...prev,
      image: ""
    }));
    const fileInput = document.querySelector('input[type="file"][data-image-type="boatImage"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCountriesForBandera = (!filterBanderaSearch.trim() || filterBanderaSearch.trim().toLowerCase() === "todas")
    ? countries
    : countries.filter(country =>
        country.name.toLowerCase().includes(filterBanderaSearch.toLowerCase()) ||
        country.code.toLowerCase().includes(filterBanderaSearch.toLowerCase())
      );

  const handleFilterBanderaSelect = (country) => {
    setFilterBandera(country.code);
    setFilterBanderaSearch(`${country.flag} ${country.name} (${country.code})`);
    setShowBanderaFilterDropdown(false);
  };

  const handleFilterBanderaSelectTodas = () => {
    setFilterBandera("");
    setFilterBanderaSearch("Todas");
    setShowBanderaFilterDropdown(false);
  };

  const handleFilterBanderaSearch = (e) => {
    const value = e.target.value;
    setFilterBanderaSearch(value);
    setShowBanderaFilterDropdown(true);
    if (!value.trim()) {
      setFilterBandera("");
    }
  };

  const handleSubmitBoatRequest = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos (incl. Puerto actual, Calado y Desplazamiento)
    const hasCurrentPort = formData.currentPort != null && String(formData.currentPort).trim() !== "";
    const hasDepth = formData.depth != null && formData.depth !== "";
    const hasDisplacement = formData.displacement != null && formData.displacement !== "";
    if (!formData.name || !formData.registrationNumber || !formData.registrationCountry || 
        !formData.registrationPort || !hasCurrentPort || !formData.boatType || !formData.lengthOverall || !formData.beam ||
        !hasDepth || !hasDisplacement) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Por favor completa todos los campos obligatorios (incl. Puerto actual, Calado y Desplazamiento)",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Si hay imagen para subir, subirla primero
      let imagePath = formData.image;
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', imageFile);
        
        const uploadResponse = await apiService.uploadBoatImage(formDataUpload);
        if (uploadResponse.status === "success" && uploadResponse.payload) {
          imagePath = uploadResponse.payload.image;
        } else {
          throw new Error(uploadResponse.msg || "Error al subir la imagen");
        }
      }

      // Preparar datos del barco con la imagen
      const boatData = {
        ...formData,
        image: imagePath
      };

      const response = await apiService.requestBoatRegistration(boatData);
      
      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Solicitud enviada",
          text: "Tu solicitud de registro de barco ha sido enviada. Un administrador la revisará y recibirás una notificación.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
        setShowAddForm(false);
        setFormData({
          name: "",
          registrationNumber: "",
          registrationCountry: "",
          registrationPort: "",
          currentPort: "",
          boatType: "",
          lengthOverall: "",
          beam: "",
          depth: "",
          displacement: "",
          image: "",
        });
        setCountrySearch("");
        setShowCountryDropdown(false);
        setImageFile(null);
        setImagePreview("");
        await loadFleet();
      } else {
        throw new Error(response.msg || "Error al solicitar el registro");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al solicitar el registro del barco",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowDetails = async (boatId, fleetItem) => {
    try {
      setLoadingCertificates(true);
      const boat = fleetItem.boatId;
      
      // Guardar el barco seleccionado
      setSelectedBoat({ ...boat, fleetItem });
      
      // Cargar certificados del barco
      try {
        const certResponse = await apiService.getCertificatesByBoat(boatId);
        if (certResponse.status === "success" && certResponse.payload) {
          setBoatCertificates(Array.isArray(certResponse.payload) ? certResponse.payload : []);
        } else {
          setBoatCertificates([]);
        }
      } catch (error) {
        console.error("Error al cargar certificados:", error);
        setBoatCertificates([]);
      }
    } catch (error) {
      console.error("Error al cargar detalles del barco:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al cargar los detalles del barco",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    } finally {
      setLoadingCertificates(false);
    }
  };

  const handleBackToList = () => {
    setSelectedBoat(null);
    setBoatCertificates([]);
    setShowCertificateForm(false);
  };

  const handleModifyCertificate = (certificate) => {
    // Cargar datos del certificado en el formulario
    setCertificateFormData({
      certificateType: certificate.certificateType || "",
      number: certificate.number || "",
      issueDate: certificate.issueDate ? new Date(certificate.issueDate).toISOString().split('T')[0] : "",
      expirationDate: certificate.expirationDate ? new Date(certificate.expirationDate).toISOString().split('T')[0] : "",
      annualInspection: certificate.annualInspection || "no_realizada",
      observations: certificate.observations || "",
      pdfFile: certificate.pdfFile || "",
    });
    setCertificatePdfFile(null);
    setShowCertificateForm(true);
    // Guardar el ID del certificado a modificar
    setEditingCertificateId(certificate._id);
  };

  const handleDeleteCertificate = async (certificateId) => {
    const result = await Swal.fire({
      title: "¿Eliminar certificado?",
      text: "¿Estás seguro de que deseas eliminar este certificado? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#082b55",
      color: "#ffffff",
      customClass: {
        confirmButton: "custom-swal-button",
        cancelButton: "custom-swal-button",
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await apiService.deleteCertificate(certificateId);
        if (response.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Certificado eliminado",
            text: "El certificado ha sido eliminado exitosamente",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          });
          // Recargar certificados
          await handleShowDetails(selectedBoat._id, selectedBoat.fleetItem);
        } else {
          throw new Error(response.msg || "Error al eliminar el certificado");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al eliminar el certificado",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    }
  };

  const handleAddCertificate = (boatId) => {
    setEditingCertificateId(null);
    setShowCertificateForm(true);
    // Resetear formulario
    setCertificateFormData({
      certificateType: "",
      number: "",
      issueDate: "",
      expirationDate: "",
      annualInspection: "No corresponde",
      observations: "",
      pdfFile: "",
    });
    setCertificatePdfFile(null);
  };

  const handleCancelCertificateForm = () => {
    setShowCertificateForm(false);
    setEditingCertificateId(null);
    setCertificateFormData({
      certificateType: "",
      number: "",
      issueDate: "",
      expirationDate: "",
      annualInspection: "no_realizada",
      observations: "",
      pdfFile: "",
    });
    setCertificatePdfFile(null);
  };

  const handleCertificateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCertificateFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCertificatePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Solo se permiten archivos PDF",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "El archivo PDF no puede ser mayor a 10MB",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
        return;
      }
      setCertificatePdfFile(file);
    }
  };

  const handleSubmitCertificate = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!certificateFormData.certificateType || 
        !certificateFormData.issueDate || !certificateFormData.expirationDate) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Por favor completa todos los campos obligatorios",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    try {
      setSubmittingCertificate(true);
      
      let pdfPath = "";
      
      // Si hay PDF para subir, subirlo primero
      if (certificatePdfFile) {
        const pdfFormData = new FormData();
        pdfFormData.append('pdfFile', certificatePdfFile);
        
        const uploadResponse = await apiService.uploadCertificatePDF(pdfFormData);
        if (uploadResponse.status === "success" && uploadResponse.payload.pdfFile) {
          pdfPath = uploadResponse.payload.pdfFile;
        } else {
          throw new Error(uploadResponse.msg || "Error al subir el PDF");
        }
      }

      // Preparar datos del certificado
      // Si el número está vacío o solo tiene espacios, usar "S/N" como default
      const certificateNumber = certificateFormData.number?.trim() || "S/N";
      
      const certificateData = {
        boatId: selectedBoat._id,
        certificateType: certificateFormData.certificateType,
        number: certificateNumber,
        issueDate: certificateFormData.issueDate,
        expirationDate: certificateFormData.expirationDate,
        annualInspection: certificateFormData.annualInspection,
        observations: certificateFormData.observations || undefined,
        pdfFile: pdfPath || certificateFormData.pdfFile || undefined,
      };

      let response;
      if (editingCertificateId) {
        // Actualizar certificado existente
        response = await apiService.updateCertificate(editingCertificateId, certificateData);
        if (response.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Certificado actualizado",
            text: "El certificado ha sido actualizado exitosamente",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          });
        } else {
          throw new Error(response.msg || "Error al actualizar el certificado");
        }
      } else {
        // Crear nuevo certificado
        response = await apiService.createCertificate(certificateData);
        if (response.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Certificado creado",
            text: "El certificado ha sido agregado exitosamente",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          });
        } else {
          throw new Error(response.msg || "Error al crear el certificado");
        }
      }
      
      // Recargar certificados y cerrar formulario
      handleCancelCertificateForm();
      await handleShowDetails(selectedBoat._id, selectedBoat.fleetItem);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al crear el certificado",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    } finally {
      setSubmittingCertificate(false);
    }
  };

  const handleRemoveBoat = async (boatId) => {
    const result = await Swal.fire({
      title: "¿Remover barco?",
      text: "¿Estás seguro de que deseas remover este barco de tu flota?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, remover",
      cancelButtonText: "Cancelar",
      background: "#082b55",
      color: "#ffffff",
      customClass: {
        confirmButton: "custom-swal-button",
        cancelButton: "btn btn-secondary",
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await apiService.removeBoatFromFleet(boatId);
        
        if (response.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Barco removido",
            text: "El barco ha sido removido de tu flota",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          });
          await loadFleet();
        } else {
          throw new Error(response.msg || "Error al remover el barco");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al remover el barco",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success">Aprobado</span>;
      case 'pending':
        return <span className="badge bg-warning">Pendiente</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rechazado</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Función para verificar si un certificado está a 3 meses o menos de vencerse
  const isCertificateExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;
    const expiration = new Date(expirationDate);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    // Normalizar fechas a inicio del día para comparación
    today.setHours(0, 0, 0, 0);
    expiration.setHours(0, 0, 0, 0);
    threeMonthsFromNow.setHours(0, 0, 0, 0);
    
    // Está próximo a vencer si la fecha de vencimiento está entre hoy y 3 meses desde hoy
    return expiration >= today && expiration <= threeMonthsFromNow;
  };

  // Función para calcular días restantes hasta el vencimiento
  const getDaysUntilExpiration = (expirationDate) => {
    if (!expirationDate) return null;
    const expiration = new Date(expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiration.setHours(0, 0, 0, 0);
    const diffTime = expiration - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para mostrar modal de advertencia de certificado próximo a vencer
  const handleCertificateExpiringWarning = (certificate) => {
    const daysLeft = getDaysUntilExpiration(certificate.expirationDate);
    Swal.fire({
      icon: "warning",
      title: "Certificado próximo a vencer",
      html: `
        <p>El certificado <strong>${certificate.certificateType}</strong> (N° ${certificate.number}) está próximo a vencer.</p>
        <p><strong>Fecha de vencimiento:</strong> ${formatDate(certificate.expirationDate)}</p>
        <p><strong>Días restantes:</strong> ${daysLeft} día${daysLeft !== 1 ? 's' : ''}</p>
        <p class="text-warning">Se recomienda iniciar los trámites de renovación lo antes posible.</p>
      `,
      confirmButtonText: "Entendido",
      background: "#082b55",
      color: "#ffffff",
      customClass: {
        confirmButton: "custom-swal-button",
      },
    });
  };

  // Función para solicitar contacto con gestor
  const handleRequestGestorContact = async (certificate) => {
    const hasGestorAssigned = !!user?.manager?.managerId;

    if (!hasGestorAssigned) {
      await Swal.fire({
        icon: "info",
        title: "No tiene gestor asignado",
        html: `
          <p>Para poder solicitar la renovación de certificados a través de un gestor, primero debe tener un gestor asignado a su cuenta.</p>
          <p>Puede asignar un gestor desde el <strong>Panel del Usuario</strong>, en la pestaña <strong>General</strong> de <strong>Mi Latias</strong>.</p>
        `,
        confirmButtonText: "Entendido",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "Solicitar contacto con gestor",
      html: `
        <p>¿Deseas solicitar que el gestor se contacte con el administrador del barco para comenzar los trámites de renovación del certificado?</p>
        <p><strong>Certificado:</strong> ${certificate.certificateType} (N° ${certificate.number})</p>
        <p><strong>Vencimiento:</strong> ${formatDate(certificate.expirationDate)}</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Solicitar",
      cancelButtonText: "Cancelar",
      background: "#082b55",
      color: "#ffffff",
      customClass: {
        confirmButton: "custom-swal-button",
      },
    });

    if (result.isConfirmed) {
      setCertificateForRequest(certificate);
      setSelectedRequestTypes([]);
      setCertificateRequestNotes("");
      setShowCertificateTypeModal(true);
    }
  };

  const REQUEST_TYPES = ["Renovación", "Preparación", "Asesoramiento"];

  const toggleRequestType = (tipo) => {
    setSelectedRequestTypes((prev) =>
      prev.includes(tipo) ? prev.filter((x) => x !== tipo) : [...prev, tipo]
    );
  };

  const handleConfirmCertificateRequest = async () => {
    if (selectedRequestTypes.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona al menos un tipo",
        text: "Elige uno o más tipos de trámite: Renovación, Preparación o Asesoramiento.",
        confirmButtonText: "Entendido",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
      return;
    }
    if (!selectedBoat?._id || !certificateForRequest) return;
    setSubmittingCertificateRequest(true);
    try {
      const res = await apiService.createCertificateRequest(
        selectedBoat._id,
        {
          certificateType: certificateForRequest.certificateType,
          number: certificateForRequest.number,
          issueDate: certificateForRequest.issueDate,
          expirationDate: certificateForRequest.expirationDate,
        },
        selectedRequestTypes,
        certificateRequestNotes.trim() || null
      );
      if (res.status === "success") {
        setShowCertificateTypeModal(false);
        setCertificateForRequest(null);
        setSelectedRequestTypes([]);
        setCertificateRequestNotes("");
        Swal.fire({
          icon: "success",
          title: "Solicitud enviada",
          text: "Tu solicitud ha sido enviada. El gestor recibirá un correo con los datos.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.msg || "No se pudo enviar la solicitud.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: e?.message || "Error al enviar la solicitud.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } finally {
      setSubmittingCertificateRequest(false);
    }
  };

  // Filtrado de barcos
  const filteredFleet = fleet.filter((fleetItem) => {
    const boat = fleetItem.boatId;
    if (!boat) return false;
    if (filterRegistro && !(String(boat.registrationNumber || "")).toLowerCase().includes(filterRegistro.toLowerCase())) return false;
    if (filterBandera && !(String(boat.registrationCountry || "")).toLowerCase().includes(filterBandera.toLowerCase())) return false;
    if (filterPuertoReg && !(String(boat.registrationPort || "")).toLowerCase().includes(filterPuertoReg.toLowerCase())) return false;
    if (filterUbicacion && !(String(boat.currentPort || "")).toLowerCase().includes(filterUbicacion.toLowerCase())) return false;
    if (filterTipo && (String(boat.boatType || "") !== filterTipo)) return false;
    if (filterEslora && !(String(boat.lengthOverall || "")).includes(filterEslora)) return false;
    if (filterManga && !(String(boat.beam || "")).includes(filterManga)) return false;
    if (filterPuntal && !(String(boat.depth || "")).includes(filterPuntal)) return false;
    if (filterDesplazamiento && !(String(boat.displacement ?? "")).includes(filterDesplazamiento)) return false;
    return true;
  });

  const clearFilters = () => {
    setFilterRegistro("");
    setFilterBandera("");
    setFilterBanderaSearch("Todas");
    setShowBanderaFilterDropdown(false);
    setFilterPuertoReg("");
    setFilterUbicacion("");
    setFilterTipo("");
    setFilterEslora("");
    setFilterManga("");
    setFilterPuntal("");
    setFilterDesplazamiento("");
  };

  // Funciones de paginación
  const totalPages = Math.max(1, Math.ceil(filteredFleet.length / boatsPerPage));
  const indexOfLastBoat = currentPage * boatsPerPage;
  const indexOfFirstBoat = indexOfLastBoat - boatsPerPage;
  const currentBoats = filteredFleet.slice(indexOfFirstBoat, indexOfLastBoat);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    flotaListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Resetear página cuando cambia la flota o los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [fleet.length, filterRegistro, filterBandera, filterPuertoReg, filterUbicacion, filterTipo, filterEslora, filterManga, filterPuntal, filterDesplazamiento]);

  // Resetear página de certificados cuando cambia la lista
  useEffect(() => {
    setCurrentCertPage(1);
  }, [boatCertificates.length]);

  const totalCertPages = Math.max(1, Math.ceil(boatCertificates.length / certsPerPage));
  const indexOfLastCert = currentCertPage * certsPerPage;
  const indexOfFirstCert = indexOfLastCert - certsPerPage;
  const currentCertificates = boatCertificates.slice(indexOfFirstCert, indexOfLastCert);

  const getCertPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentCertPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalCertPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    return pageNumbers;
  };

  const handleCertPageChange = (page) => {
    setCurrentCertPage(page);
    flotaCertificadosSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!user?.premium?.isActive) {
    return (
      <FadeIn>
        <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-between container">
          <div className="col-12">
            <h2 className="mb-0 text-orange">Flota:</h2>
          </div>
          <div className="div-border-color my-4"></div>
          <div className="text-center my-5 d-flex flex-column align-items-center col-12">
            <i className="bi bi-water mb-4 custom-display-1 text-orange" aria-hidden="true" />
            <h3>Debes comprar un plan de gestoría para utilizar esta sección.</h3>
            <p className="fst-italic">Tu flota espera órdenes.</p>
            <Link to="/gestoria#planes" className="btn btn-warning my-3">
              Ver planes
            </Link>
          </div>
        </div>
      </FadeIn>
    );
  }

  if (loading) {
    return (
      <FadeIn>
        <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-center justify-content-center container" style={{ minHeight: "60vh" }}>
          <div className="spinner-border text-orange mb-3" role="status">
            <span className="visually-hidden">Cargando flota...</span>
          </div>
          <p className="text-white mt-2 mb-0">Cargando tu flota...</p>
        </div>
      </FadeIn>
    );
  }

  return (
    <>
      <FadeIn>
        <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-between container">
          <div className="col-12 d-flex justify-content-between align-items-center flota-title-row">
            <h2 className="mb-0 text-orange">Mi Flota:</h2>
            {!showAddForm && !selectedBoat && (
              <button
                className="btn btn-warning flota-add-boat-btn"
                onClick={handleOpenAddForm}
              >
                <i className="bi bi-plus-circle-fill me-2"></i>
                Agregar barco
              </button>
            )}
          </div>
          <div className="div-border-color my-4"></div>

          {selectedBoat ? (
            // Vista de detalles del barco
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 text-orange">{selectedBoat.name} <small className="text-muted">({selectedBoat.registrationNumber})</small></h2>
              </div>
              
              {/* Datos del barco */}
              <div className="flota-form-container mb-4">
                <h4 className="text-orange mb-4">Información del Barco</h4>
                
                {/* Imagen del barco */}
                {selectedBoat.image && (
                  <div className="mb-4">
                    <img 
                      src={selectedBoat.image} 
                      alt={selectedBoat.name}
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '2px solid rgba(255, 165, 0, 0.3)'
                      }}
                    />
                  </div>
                )}
                
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <p className="mb-2">
                      <i className="bi bi-tag-fill me-2 text-orange"></i>
                      <strong className="text-orange">Número de Registro:</strong> <span className="text-white">{selectedBoat.registrationNumber}</span>
                    </p>
                  </div>
                  <div className="col-12 col-md-6 d-flex align-items-center">
                    <p className="mb-2 d-flex align-items-center f-row">
                      <i className="bi bi-flag-fill me-2 text-orange"></i>
                      <strong className="text-orange">Bandera:</strong> <span className="text-white d-flex align-items-center"><CountryFlag countryCode={selectedBoat.registrationCountry} /></span>
                    </p>
                  </div>
                  <div className="col-12 col-md-6">
                    <p className="mb-2">
                      <i className="bi bi-geo-alt-fill me-2 text-orange"></i>
                      <strong className="text-orange">Puerto de Registro:</strong> <span className="text-white">{selectedBoat.registrationPort}</span>
                    </p>
                  </div>
                  {selectedBoat.currentPort && (
                    <div className="col-12 col-md-6">
                      <p className="mb-2">
                        <i className="bi bi-geo-fill me-2 text-orange"></i>
                        <strong className="text-orange">Ubicación Actual:</strong> <span className="text-white">{selectedBoat.currentPort}</span>
                      </p>
                    </div>
                  )}
                  <div className="col-12 col-md-6">
                    <p className="mb-2">
                      <i className="bi bi-gear-fill me-2 text-orange"></i>
                      <strong className="text-orange">Tipo:</strong> <span className="text-white">{selectedBoat.boatType}</span>
                    </p>
                  </div>
                  {selectedBoat.lengthOverall && (
                    <div className="col-12 col-md-6">
                      <p className="mb-2">
                        <i className="bi bi-rulers me-2 text-orange"></i>
                        <strong className="text-orange">Eslora:</strong> <span className="text-white">{selectedBoat.lengthOverall} mts.</span>
                      </p>
                    </div>
                  )}
                  {selectedBoat.beam && (
                    <div className="col-12 col-md-6">
                      <p className="mb-2">
                        <i className="bi bi-rulers me-2 text-orange"></i>
                        <strong className="text-orange">Manga:</strong> <span className="text-white">{selectedBoat.beam} mts.</span>
                      </p>
                    </div>
                  )}
                  {selectedBoat.depth && (
                    <div className="col-12 col-md-6">
                      <p className="mb-2">
                        <i className="bi bi-rulers me-2 text-orange"></i>
                        <strong className="text-orange">Puntal:</strong> <span className="text-white">{selectedBoat.depth} mts.</span>
                      </p>
                    </div>
                  )}
                  {selectedBoat.displacement && (
                    <div className="col-12 col-md-6">
                      <p className="mb-2">
                        <i className="bi bi-speedometer me-2 text-orange"></i>
                        <strong className="text-orange">Desplazamiento:</strong> <span className="text-white">{selectedBoat.displacement} tons.</span>
                      </p>
                    </div>
                  )}
                  <div className="col-12 col-md-6">
                    <p className="mb-2">
                      <i className="bi bi-info-circle-fill me-2 text-orange"></i>
                      <strong className="text-orange">Estado:</strong> {getStatusBadge(selectedBoat.fleetItem?.status || 'pending')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificados del barco: título y botón fuera, tarjetas debajo */}
              <div ref={flotaCertificadosSectionRef} className="d-flex justify-content-between mb-3 flota-certificados-header">
                <h4 className="text-orange mb-0 me-2">Certificados del barco:</h4>
                {selectedBoat.fleetItem?.status === 'approved' && (
                  <button
                    className="btn btn-warning flota-add-boat-btn"
                    onClick={() => handleAddCertificate(selectedBoat._id)}
                  >
                    <i className="bi bi-plus-circle-fill me-2"></i>
                    Agregar certificado
                  </button>
                )}
              </div>

              {loadingCertificates ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-orange" role="status">
                    <span className="visually-hidden">Cargando certificados...</span>
                  </div>
                </div>
              ) : boatCertificates.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-x-fill text-orange mb-3" style={{ fontSize: "4rem" }}></i>
                  <p className="text-white">Este barco no tiene certificados registrados</p>
                </div>
              ) : (
                <div className="flota-certificates-cards">
                  {currentCertificates.map((certificate) => (
                    <div key={certificate._id} className="flota-certificate-card">
                      <div className="flota-certificate-card-body">
                        <div className="flota-certificate-card-main">
                          <div className="flota-certificate-field">
                            <span className="flota-certificate-label">Tipo</span>
                            <span className="flota-certificate-value">{certificate.certificateType}</span>
                          </div>
                          <div className="flota-certificate-field">
                            <span className="flota-certificate-label">Número</span>
                            <span className="flota-certificate-value">{certificate.number || '-'}</span>
                          </div>
                          <div className="flota-certificate-field">
                            <span className="flota-certificate-label">Emisión</span>
                            <span className="flota-certificate-value">{formatDate(certificate.issueDate)}</span>
                          </div>
                          <div className="flota-certificate-field">
                            <span className="flota-certificate-label">Vencimiento</span>
                            <span className="flota-certificate-value">{formatDate(certificate.expirationDate)}</span>
                          </div>
                          <div className="flota-certificate-field">
                            <span className="flota-certificate-label">Estado</span>
                            <span className="flota-certificate-value">
                              {certificate.status === 'vigente' && (
                                isCertificateExpiringSoon(certificate.expirationDate) ? (
                                  <span
                                    className="badge bg-warning certificate-expiring-badge"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleCertificateExpiringWarning(certificate)}
                                    title="Click para más información"
                                  >
                                    Vigente
                                  </span>
                                ) : (
                                  <span className="badge bg-success">Vigente</span>
                                )
                              )}
                              {certificate.status === 'vencido' && <span className="badge bg-danger">Vencido</span>}
                              {certificate.status === 'anulado' && <span className="badge bg-secondary">Anulado</span>}
                            </span>
                          </div>
                          {certificate.observations && (
                            <div className="flota-certificate-field flota-certificate-observations">
                              <span className="flota-certificate-label">Observaciones</span>
                              <span className="flota-certificate-value">{certificate.observations}</span>
                            </div>
                          )}
                        </div>
                        <div className="flota-certificate-card-actions">
                          {certificate.pdfFile && (
                            <a
                              href={certificate.pdfFile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-link"
                              title="Ver PDF"
                            >
                              <i className="bi bi-file-earmark-pdf-fill me-1"></i>
                              Ver PDF
                            </a>
                          )}
                          <a
                            href="#"
                            className="action-link"
                            onClick={(e) => {
                              e.preventDefault();
                              handleModifyCertificate(certificate);
                            }}
                            title="Modificar"
                          >
                            <i className="bi bi-pencil-fill me-1"></i>
                            Modificar
                          </a>
                          <a
                            href="#"
                            className="action-link action-link-danger"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteCertificate(certificate._id);
                            }}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash-fill me-1"></i>
                            Eliminar
                          </a>
                          {((certificate.status === 'vigente' && isCertificateExpiringSoon(certificate.expirationDate)) || certificate.status === 'vencido') && (
                            <a
                              href="#"
                              className="action-link"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRequestGestorContact(certificate);
                              }}
                              title="Solicitar contacto con gestor"
                            >
                              <i className="bi bi-person-badge-fill me-1"></i>
                              Gestor
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paginación certificados (siempre visible cuando hay lista o vacía) */}
              {!loadingCertificates && (
                <div className="d-flex flex-column align-items-center mt-4 flota-certificates-pagination">
                  <Pagination className="mb-0">
                    <Pagination.First
                      onClick={() => handleCertPageChange(1)}
                      disabled={currentCertPage === 1 || totalCertPages === 0}
                      className="custom-pagination-item"
                    />
                    <Pagination.Prev
                      onClick={() => handleCertPageChange(currentCertPage - 1)}
                      disabled={currentCertPage === 1 || totalCertPages === 0}
                      className="custom-pagination-item"
                    />
                    {totalCertPages > 0 ? (
                      getCertPageNumbers().map((number) => (
                        <Pagination.Item
                          key={number}
                          active={number === currentCertPage}
                          onClick={() => handleCertPageChange(number)}
                          className="custom-pagination-item"
                        >
                          {number}
                        </Pagination.Item>
                      ))
                    ) : (
                      <Pagination.Item active disabled className="custom-pagination-item">
                        1
                      </Pagination.Item>
                    )}
                    <Pagination.Next
                      onClick={() => handleCertPageChange(currentCertPage + 1)}
                      disabled={currentCertPage === totalCertPages || totalCertPages === 0}
                      className="custom-pagination-item"
                    />
                    <Pagination.Last
                      onClick={() => handleCertPageChange(totalCertPages || 1)}
                      disabled={currentCertPage === (totalCertPages || 1) || totalCertPages === 0}
                      className="custom-pagination-item"
                    />
                  </Pagination>
                  <div className="text-white mt-2">
                    Página {currentCertPage} de {totalCertPages || 1} ({boatCertificates.length} certificados)
                  </div>
                </div>
              )}

              {/* Formulario para agregar certificado */}
              {showCertificateForm && (
                <div className="flota-form-container mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="text-orange mb-0">{editingCertificateId ? "Modificar certificado" : "Agregar certificado"}</h4>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={handleCancelCertificateForm}
                    >
                      <i className="bi bi-x-lg" style={{width: "auto"}}></i>
                    </button>
                  </div>
                  <div className="div-border-color my-3"></div>
                  <form onSubmit={handleSubmitCertificate} className="flota-registration-form">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="flota-form-label">Tipo de Certificado <span className="text-danger">*</span></label>
                        <select
                          className="form-select flota-form-select"
                          name="certificateType"
                          value={certificateFormData.certificateType}
                          onChange={handleCertificateInputChange}
                          required
                        >
                          <option value="">Seleccione un tipo</option>
                          <option value="Cert. Navegabilidad">Cert. Navegabilidad</option>
                          <option value="Cert. Licencia Estación">Cert. Licencia Estación</option>
                          <option value="Cert. Balsas Salvavidas">Cert. Balsas Salvavidas</option>
                          <option value="Tasa Anual">Tasa Anual</option>
                          <option value="Trib. Emb. Extranjera">Trib. Emb. Extranjera</option>
                          <option value="Venc. Bengalas">Venc. Bengalas</option>
                          <option value="Venc. Extintor">Venc. Extintor</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="flota-form-label">Número</label>
                        <input
                          type="text"
                          className="form-control flota-form-control"
                          name="number"
                          value={certificateFormData.number}
                          onChange={handleCertificateInputChange}
                          placeholder="S/N"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="flota-form-label">Fecha de Emisión <span className="text-danger">*</span></label>
                        <input
                          type="date"
                          className="form-control flota-form-control"
                          name="issueDate"
                          value={certificateFormData.issueDate}
                          onChange={handleCertificateInputChange}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="flota-form-label">Fecha de Vencimiento <span className="text-danger">*</span></label>
                        <input
                          type="date"
                          className="form-control flota-form-control"
                          name="expirationDate"
                          value={certificateFormData.expirationDate}
                          onChange={handleCertificateInputChange}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="flota-form-label">Inspección Anual <span className="text-danger">*</span></label>
                        <select
                          className="form-select flota-form-select"
                          name="annualInspection"
                          value={certificateFormData.annualInspection}
                          onChange={handleCertificateInputChange}
                          required
                        >
                          <option value="No corresponde">No corresponde</option>
                          <option value="No realizada">No realizada</option>
                          <option value="Realizada">Realizada</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="flota-form-label">PDF del Certificado (Opcional)</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="form-control flota-form-control"
                          onChange={handleCertificatePdfChange}
                        />
                        <small className="text-muted d-block mt-1">
                          Máximo 10MB
                        </small>
                        {certificatePdfFile && (
                          <small className="text-success d-block mt-1">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Archivo seleccionado: {certificatePdfFile.name}
                          </small>
                        )}
                      </div>
                      <div className="col-12">
                        <label className="flota-form-label">Observaciones</label>
                        <textarea
                          className="form-control flota-form-control"
                          name="observations"
                          rows="3"
                          value={certificateFormData.observations}
                          onChange={handleCertificateInputChange}
                        />
                      </div>
                    </div>
                    <div className="div-border-color my-4"></div>
                    <div className="d-flex justify-content-end gap-3">
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleCancelCertificateForm}
                        disabled={submittingCertificate}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-warning"
                        disabled={submittingCertificate}
                      >
                        {submittingCertificate ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: "0.8em", height: "0.8em", borderWidth: "0.12em", borderColor: "#082b55", borderRightColor: "transparent", verticalAlign: "middle" }}></span>
                            Creando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle-fill me-2"></i>
                            {editingCertificateId ? "Actualizar Certificado" : "Crear Certificado"}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-outline-orange"
                  onClick={handleBackToList}
                >
                  <i className="bi bi-arrow-left-circle-fill me-2"></i>
                  Volver
                </button>
              </div>
            </div>
          ) : (
            // Vista normal (formulario o lista de barcos)
            <div className="col-12 d-flex flex-column gap-4">
            {showAddForm ? (
              <div className="flota-form-container">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="text-orange mb-0">Solicitar Registro de Barco</h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={handleCancelForm}
                  >
                    <i className="bi bi-x-lg" style={{width: "auto"}}></i>
                  </button>
                </div>
                <div className="div-border-color my-3"></div>
                <form onSubmit={handleSubmitBoatRequest} className="flota-registration-form">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="flota-form-label">Nombre del Barco <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control flota-form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="flota-form-label">Número de Registro <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control flota-form-control"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="flota-form-label">País de Registro <span className="text-danger">*</span></label>
                      <div className="position-relative">
                        {formData.registrationCountry && countrySearch && !showCountryDropdown ? (
                          <div
                            className="form-control flota-form-control country-input-display"
                            onClick={() => {
                              setCountrySearch("");
                              setShowCountryDropdown(true);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <TwemojiFlag emoji={countrySearch} />
                          </div>
                        ) : (
                          <input
                            type="text"
                            className="form-control flota-form-control"
                            value={countrySearch}
                            onChange={handleCountrySearch}
                            onFocus={() => {
                              if (!formData.registrationCountry) {
                                setShowCountryDropdown(true);
                              } else {
                                // Si ya hay un país seleccionado, mostrar todos al enfocar
                                setCountrySearch("");
                                setShowCountryDropdown(true);
                              }
                            }}
                            placeholder="Buscar país..."
                            required
                          />
                        )}
                        {showCountryDropdown && (
                          <div className="country-dropdown">
                            {filteredCountries.length > 0 ? (
                              filteredCountries.map((country) => (
                                <div
                                  key={country.code}
                                  className="country-option"
                                  onClick={() => handleCountrySelect(country)}
                                >
                                  <span className="country-flag">
                                    <TwemojiFlag emoji={country.flag} />
                                  </span>
                                  <span className="country-name">{country.name}</span>
                                  <span className="country-code">{country.code}</span>
                                </div>
                              ))
                            ) : (
                              <div className="country-option no-results">
                                No se encontraron países
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="flota-form-label">Puerto de Registro <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control flota-form-control"
                        name="registrationPort"
                        value={formData.registrationPort}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="flota-form-label">Puerto Actual <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control flota-form-control"
                        name="currentPort"
                        value={formData.currentPort}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="flota-form-label">Tipo de Barco <span className="text-danger">*</span></label>
                      <select
                        className="form-select flota-form-select"
                        name="boatType"
                        value={formData.boatType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">-- Selecciona un tipo --</option>
                        {boatTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="flota-form-label">Eslora (mts.) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control flota-form-control"
                        name="lengthOverall"
                        value={formData.lengthOverall}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="flota-form-label">Manga (mts.) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control flota-form-control"
                        name="beam"
                        value={formData.beam}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="flota-form-label">Calado (mts.) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control flota-form-control"
                        name="depth"
                        value={formData.depth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="flota-form-label">Desplazamiento (tons.) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control flota-form-control"
                        name="displacement"
                        value={formData.displacement}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="flota-form-label">Imagen del Barco</label>
                      <input
                        type="file"
                        accept="image/*"
                        data-image-type="boatImage"
                        className="form-control flota-form-control"
                        onChange={handleImageChange}
                      />
                      <small className="text-muted d-block mt-1">
                        Resolución óptima: 600x400px (máximo 5MB)
                      </small>
                      {imagePreview && (
                        <div className="mt-2">
                          <img 
                            src={imagePreview} 
                            alt="Preview barco" 
                            onClick={removeImage}
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '200px', 
                              borderRadius: '5px',
                              cursor: 'pointer',
                              border: '2px solid rgba(255, 165, 0, 0.5)'
                            }}
                            title="Click para eliminar"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="div-border-color my-4"></div>
                  <div className="d-flex justify-content-end gap-3">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleCancelForm}
                      disabled={submitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: "1em", height: "1em", borderWidth: "0.15em", borderColor: "#082b55", borderRightColor: "transparent" }}></span>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle-fill me-2"></i> Solicitar registro
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : fleet.length === 0 ? (
              <div className="text-center my-5 d-flex flex-column align-items-center col-12">
                <i className="bi bi-water mb-4 custom-display-1 text-orange"></i>
                <h3>Tu flota está vacía</h3>
                <p className="fst-italic">
                  ¡Agrega barcos a tu flota para comenzar a administrarlos!
                </p>
              </div>
            ) : (
              <>
                <div className="portafolio-filters col-12 mb-4">
                  <h4 className="text-orange"><i className="bi bi-funnel-fill me-2"></i>Filtros:</h4>
                  <div className="row g-2 portafolio-modal-filters">
                    <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                      <label className="portafolio-modal-filter-label">Registro</label>
                      <input type="text" className="form-control portafolio-input form-control-sm" value={filterRegistro} onChange={(e) => setFilterRegistro(e.target.value)} />
                    </div>
                    <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                      <label className="portafolio-modal-filter-label">Bandera</label>
                      <div className="position-relative flota-filter-bandera-wrap">
                        {filterBandera && filterBanderaSearch && !showBanderaFilterDropdown ? (
                          <div
                            className="form-control portafolio-input form-control-sm country-input-display"
                            style={{ minHeight: "31px", cursor: "pointer" }}
                            onClick={() => {
                              setFilterBanderaSearch("");
                              setShowBanderaFilterDropdown(true);
                            }}
                          >
                            <TwemojiFlag emoji={filterBanderaSearch} />
                          </div>
                        ) : (
                          <input
                            type="text"
                            className="form-control portafolio-input form-control-sm"
                            value={filterBanderaSearch}
                            onChange={handleFilterBanderaSearch}
                            onFocus={() => setShowBanderaFilterDropdown(true)}
                            placeholder="Buscar país..."
                          />
                        )}
                        {showBanderaFilterDropdown && (
                          <div className="country-dropdown">
                            <div
                              className="country-option"
                              onClick={handleFilterBanderaSelectTodas}
                            >
                              <span className="country-name text-white-50">Todas</span>
                            </div>
                            {filteredCountriesForBandera.length > 0 ? (
                              filteredCountriesForBandera.map((country) => (
                                <div
                                  key={country.code}
                                  className="country-option"
                                  onClick={() => handleFilterBanderaSelect(country)}
                                >
                                  <span className="country-flag">
                                    <TwemojiFlag emoji={country.flag} />
                                  </span>
                                  <span className="country-name">{country.name}</span>
                                  <span className="country-code">{country.code}</span>
                                </div>
                              ))
                            ) : (
                              <div className="country-option no-results">
                                No se encontraron países
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                      <label className="portafolio-modal-filter-label">Puerto Reg.</label>
                      <input type="text" className="form-control portafolio-input form-control-sm" value={filterPuertoReg} onChange={(e) => setFilterPuertoReg(e.target.value)} />
                    </div>
                    <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                      <label className="portafolio-modal-filter-label">Ubicación</label>
                      <input type="text" className="form-control portafolio-input form-control-sm" value={filterUbicacion} onChange={(e) => setFilterUbicacion(e.target.value)} />
                    </div>
                    <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                      <label className="portafolio-modal-filter-label">Tipo</label>
                      <select
                        className="form-select portafolio-input form-control-sm"
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value)}
                      >
                        <option value="">Todos</option>
                        {boatTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                      <label className="portafolio-modal-filter-label">Eslora</label>
                      <input type="text" className="form-control portafolio-input form-control-sm" value={filterEslora} onChange={(e) => setFilterEslora(e.target.value)} />
                    </div>
                    <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                      <label className="portafolio-modal-filter-label">Manga</label>
                      <input type="text" className="form-control portafolio-input form-control-sm" value={filterManga} onChange={(e) => setFilterManga(e.target.value)} />
                    </div>
                    <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                      <label className="portafolio-modal-filter-label">Puntal</label>
                      <input type="text" className="form-control portafolio-input form-control-sm" value={filterPuntal} onChange={(e) => setFilterPuntal(e.target.value)} />
                    </div>
                    <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                      <label className="portafolio-modal-filter-label">Desplazamiento</label>
                      <input type="text" className="form-control portafolio-input form-control-sm" value={filterDesplazamiento} onChange={(e) => setFilterDesplazamiento(e.target.value)} />
                    </div>
                  </div>
                  <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2 mt-3 flota-filters-actions">
                    <button type="button" className="btn btn-outline-orange btn-sm" onClick={clearFilters}>
                      <i className="bi bi-funnel me-1"></i>Limpiar filtros
                    </button>
                  </div>
                </div>

                <div ref={flotaListRef}>
                {filteredFleet.length === 0 ? (
                  <div className="text-center text-white py-5">
                    <i className="bi bi-inbox-fill text-orange" style={{ fontSize: "4rem" }}></i>
                    <p className="mt-3">No hay barcos que coincidan con los filtros.</p>
                  </div>
                ) : (
                <div className="row g-3">
                  {currentBoats.map((fleetItem, index) => {
                  const boat = fleetItem.boatId;
                  if (!boat) return null;

                  return (
                    <div key={fleetItem._id || index} className="col-12 col-lg-6">
                      <FadeIn inline>
                      <div className="boat-card-minimal">
                        {boat.image && (
                          <div className="boat-card-image">
                            <img src={boat.image} alt={boat.name} />
                          </div>
                        )}
                        <div className="boat-card-content">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="text-orange mb-2">{boat.name}</h5>
                            {getStatusBadge(fleetItem.status)}
                          </div>
                          <div className="boat-card-details">
                            <div className="row g-2">
                              <div className="col-6">
                                <p className="mb-1">
                                  <i className="bi bi-tag-fill me-1 text-orange"></i>
                                  <small><strong>Registro:</strong> {boat.registrationNumber}</small>
                                </p>
                              </div>
                              <div className="col-6">
                                <p className="mb-1 d-flex align-items-center">
                                  <i className="bi bi-flag-fill me-1 text-orange"></i>
                                  <small class="d-flex align-items-center"><strong>Bandera:</strong> <CountryFlag countryCode={boat.registrationCountry} /></small>
                                </p>
                              </div>
                              <div className="col-6">
                                <p className="mb-1">
                                  <i className="bi bi-geo-alt-fill me-1 text-orange"></i>
                                  <small><strong>Puerto Reg.:</strong> {boat.registrationPort || "—"}</small>
                                </p>
                              </div>
                              <div className="col-6">
                                <p className="mb-1">
                                  <i className="bi bi-geo-fill me-1 text-orange"></i>
                                  <small><strong>Ubicación:</strong> {boat.currentPort || "—"}</small>
                                </p>
                              </div>
                              <div className="col-6">
                                <p className="mb-1">
                                  <i className="bi bi-gear-fill me-1 text-orange"></i>
                                  <small><strong>Tipo:</strong> {boat.boatType || "—"}</small>
                                </p>
                              </div>
                              {boat.lengthOverall && (
                                <div className="col-6">
                                  <p className="mb-1">
                                    <i className="bi bi-rulers me-1 text-orange"></i>
                                    <small><strong>Eslora:</strong> {boat.lengthOverall} mts.</small>
                                  </p>
                                </div>
                              )}
                              {boat.beam && (
                                <div className="col-6">
                                  <p className="mb-1">
                                    <i className="bi bi-rulers me-1 text-orange"></i>
                                    <small><strong>Manga:</strong> {boat.beam} mts.</small>
                                  </p>
                                </div>
                              )}
                              {boat.depth && (
                                <div className="col-6">
                                  <p className="mb-1">
                                    <i className="bi bi-rulers me-1 text-orange"></i>
                                    <small><strong>Puntal:</strong> {boat.depth} mts.</small>
                                  </p>
                                </div>
                              )}
                              <div className="col-6">
                                <p className="mb-1">
                                  <i className="bi bi-speedometer me-1 text-orange"></i>
                                  <small><strong>Desplazamiento:</strong> {boat.displacement != null && boat.displacement !== "" ? `${boat.displacement} tons.` : "—"}</small>
                                </p>
                              </div>
                              <div className="col-6">
                                <p className="mb-1">
                                  <i className="bi bi-file-earmark-text-fill me-1 text-orange"></i>
                                  <small><strong>Certificados:</strong> {certificatesCount[boat._id] || certificatesCount[fleetItem.boatId] || certificatesCount[fleetItem._id] || 0}</small>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="boat-card-actions mt-3 d-flex gap-2">
                            <button
                              className="btn btn-sm btn-warning boat-card-btn-details"
                              onClick={() => handleShowDetails(boat._id || fleetItem.boatId, fleetItem)}
                            >
                              <i className="bi bi-info-circle-fill me-2"></i>
                              Más detalles
                            </button>
                            <button
                              className="btn btn-sm btn-danger boat-card-btn-remove"
                              onClick={() => handleRemoveBoat(boat._id || fleetItem.boatId)}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      </FadeIn>
                    </div>
                  );
                  })}
                </div>
                )}
                </div>

                {/* Paginación */}
                <div className="d-flex flex-column align-items-center mt-4 mb-4">
                  <Pagination className="mb-0">
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1 || totalPages === 0}
                      className="custom-pagination-item"
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || totalPages === 0}
                      className="custom-pagination-item"
                    />
                    {totalPages > 0 ? (
                      getPageNumbers().map((number) => (
                        <Pagination.Item
                          key={number}
                          active={number === currentPage}
                          onClick={() => handlePageChange(number)}
                          className="custom-pagination-item"
                        >
                          {number}
                        </Pagination.Item>
                      ))
                    ) : (
                      <Pagination.Item active disabled className="custom-pagination-item">
                        1
                      </Pagination.Item>
                    )}
                    <Pagination.Next
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="custom-pagination-item"
                    />
                    <Pagination.Last
                      onClick={() => handlePageChange(totalPages || 1)}
                      disabled={currentPage === (totalPages || 1) || totalPages === 0}
                      className="custom-pagination-item"
                    />
                  </Pagination>
                  <div className="text-white mt-2">
                    Página {currentPage} de {totalPages || 1} ({filteredFleet.length} barcos)
                  </div>
                </div>
              </>
            )}
            </div>
          )}
        </div>

        {/* Modal tipo de solicitud (certificado → gestor) */}
        <Modal
          show={showCertificateTypeModal}
          onHide={() => !submittingCertificateRequest && setShowCertificateTypeModal(false)}
          centered
          className="general-modal-dark"
          contentClassName="general-modal-content"
        >
          <Modal.Header closeButton className="general-modal-header">
            <Modal.Title className="text-orange">Tipo de solicitud</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-white">
            <p className="mb-3">Selecciona uno o más tipos de trámite para notificar al gestor:</p>
            {certificateForRequest && (
              <p className="mb-3 text-muted small">
                Certificado: <strong className="text-white">{certificateForRequest.certificateType}</strong> (Nº {certificateForRequest.number})
              </p>
            )}
            <Form>
              {REQUEST_TYPES.map((tipo) => (
                <Form.Check
                  key={tipo}
                  type="checkbox"
                  id={`request-type-${tipo}`}
                  label={tipo}
                  checked={selectedRequestTypes.includes(tipo)}
                  onChange={() => toggleRequestType(tipo)}
                  className="text-white mb-2"
                />
              ))}
              <Form.Group className="mt-3">
                <Form.Label className="text-white">Notas</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Opcional: agrega notas para el gestor..."
                  value={certificateRequestNotes}
                  onChange={(e) => setCertificateRequestNotes(e.target.value)}
                  className="flota-form-control"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="general-modal-footer">
            <Button
              variant="danger"
              onClick={() => setShowCertificateTypeModal(false)}
              disabled={submittingCertificateRequest}
            >
              Cancelar
            </Button>
            <Button
              variant="warning"
              onClick={handleConfirmCertificateRequest}
              disabled={submittingCertificateRequest || selectedRequestTypes.length === 0}
            >
              {submittingCertificateRequest ? "Enviando..." : "Confirmar"}
            </Button>
          </Modal.Footer>
        </Modal>
      </FadeIn>
    </>
  );
}
