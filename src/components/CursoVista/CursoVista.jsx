import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Accordion, OverlayTrigger, Popover, Button, Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/apiService";
import { FadeIn } from "../FadeIn/FadeIn";
import "./CursoVista.css";

const QUIZ_MIN_PASS_PERCENT = 70;
const QUIZ_MINUTES_PER_QUESTION = 2;
const FINAL_TEST_MODULE_ID = "final";
const MAX_FINAL_QUESTIONS = 25;
/** Mínimo promedio de pruebas parciales para aprobar el curso (%). */
const PARTIAL_AVG_MIN = 60;
/** Mínimo en prueba final para aprobar el curso (%). */
const FINAL_TEST_MIN = 70;

export function CursoVista() {
  const { courseId } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [activeLessonKey, setActiveLessonKey] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [updatingLessonKey, setUpdatingLessonKey] = useState(null);
  const [transitionLeaving, setTransitionLeaving] = useState(false);
  const [pendingModuleId, setPendingModuleId] = useState(null);
  const [pendingLessonKey, setPendingLessonKey] = useState(null);
  /** Resultados de pruebas por módulo: { [moduleId]: score (0-100) } */
  const [moduleTestResults, setModuleTestResults] = useState(() => {
    try {
      const stored = localStorage.getItem("cursoVistaModuleTestResults");
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return {};
  });
  /** Quiz en curso */
  const [quizState, setQuizState] = useState({
    moduleId: null,
    step: "idle",
    questionIndex: 0,
    answers: {},
    startTime: null,
    timeRemainingMs: null,
  });
  const [quizTimerId, setQuizTimerId] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const quizResultSentRef = useRef(false);
  const quizStateRef = useRef(quizState);
  const quizTimerIdRef = useRef(null);
  useEffect(() => {
    quizStateRef.current = quizState;
  }, [quizState]);

  const purchasedCourses = Array.isArray(user?.purchasedCourses) ? user.purchasedCourses : [];
  const hasPurchasedCourse = useMemo(
    () =>
      purchasedCourses.some(
        (c) => String(c?.courseId ?? c?.course?.courseId ?? "") === String(courseId)
      ),
    [purchasedCourses, courseId]
  );

  const userCourse = useMemo(
    () => purchasedCourses.find((c) => String(c?.courseId ?? c?.course?.courseId ?? "") === String(courseId)),
    [purchasedCourses, courseId]
  );

  const modulesWithProgress = useMemo(() => {
    const fromUser = userCourse?.modulesCompleted;
    const fromCourse = course?.modules ?? [];
    const mods = (fromUser && fromUser.length > 0) ? fromUser : fromCourse;
    if (mods.length === 0) return [];
    return mods.map((mod) => {
      const lessons = Array.isArray(mod.lessons)
        ? mod.lessons.map((l) => ({ ...l, completed: l.completed === true }))
        : [];
      const completedCount = lessons.filter((l) => l.completed).length;
      const allLessonsCompleted = lessons.length > 0 && completedCount === lessons.length;
      return {
        moduleId: mod.moduleId,
        moduleName: mod.moduleName,
        lessons,
        allLessonsCompleted,
        testAttempts: mod.testAttempts ?? 0,
        lastTestScore: mod.lastTestScore ?? null,
      };
    });
  }, [userCourse?.modulesCompleted, course?.modules]);

  const allPartialTestsAttempted = useMemo(
    () => modulesWithProgress.length > 0 && modulesWithProgress.every((m) => (userCourse?.modulesCompleted?.find((mc) => String(mc.moduleId) === String(m.moduleId))?.testAttempts ?? 0) >= 1),
    [modulesWithProgress, userCourse?.modulesCompleted]
  );

  const displayModules = useMemo(() => {
    if (!allPartialTestsAttempted) return modulesWithProgress;
    return [
      ...modulesWithProgress,
      {
        moduleId: FINAL_TEST_MODULE_ID,
        moduleName: "Prueba final del curso",
        lessons: [],
        allLessonsCompleted: true,
        testAttempts: userCourse?.finalTestAttempts ?? 0,
        lastTestScore: userCourse?.finalTestLastScore ?? null,
      },
    ];
  }, [modulesWithProgress, allPartialTestsAttempted, userCourse?.finalTestAttempts, userCourse?.finalTestLastScore]);

  /** Puntaje de la prueba parcial o final: solo desde el backend. */
  const getModuleTestScore = useCallback(
    (moduleId) => {
      if (moduleId === FINAL_TEST_MODULE_ID) return userCourse?.finalTestLastScore ?? null;
      return userCourse?.modulesCompleted?.find((m) => String(m.moduleId) === String(moduleId))?.lastTestScore ?? null;
    },
    [userCourse?.modulesCompleted, userCourse?.finalTestLastScore]
  );

  const getModuleTestAttempts = useCallback(
    (moduleId) => {
      if (moduleId === FINAL_TEST_MODULE_ID) return userCourse?.finalTestAttempts ?? 0;
      return userCourse?.modulesCompleted?.find((m) => String(m.moduleId) === String(moduleId))?.testAttempts ?? 0;
    },
    [userCourse?.modulesCompleted, userCourse?.finalTestAttempts]
  );

  /** Resumen para el modal: resultados parciales, promedio, prueba final, aprobación y nota final. */
  const summaryData = useMemo(() => {
    const partials = (modulesWithProgress || []).map((m) => ({
      moduleName: m.moduleName,
      score: getModuleTestScore(m.moduleId) ?? null,
    }));
    const scoresOnly = partials.map((p) => p.score).filter((s) => s != null && typeof s === "number");
    const avgPartial = scoresOnly.length > 0
      ? Math.round((scoresOnly.reduce((a, b) => a + b, 0) / scoresOnly.length) * 10) / 10
      : null;
    const finalScore = userCourse?.finalTestLastScore ?? null;
    const hasFinalScore = finalScore != null && typeof finalScore === "number";
    const passed = hasFinalScore && avgPartial != null && avgPartial >= PARTIAL_AVG_MIN && finalScore >= FINAL_TEST_MIN;
    const finalGrade = passed ? Math.round((finalScore * 0.6 + avgPartial * 0.4) * 10) / 10 : null;
    return { partials, avgPartial, finalScore, passed, finalGrade };
  }, [modulesWithProgress, userCourse?.finalTestLastScore, getModuleTestScore]);

  const finalTestQuestions = useMemo(() => {
    const modules = course?.modules ?? [];
    const all = [];
    modules.forEach((mod) => {
      const bank = Array.isArray(mod?.questionBank) ? mod.questionBank : [];
      bank.forEach((q) => {
        all.push({
          ...q,
          questionId: `${mod.moduleId}-${q.questionId}`,
        });
      });
    });
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, MAX_FINAL_QUESTIONS);
  }, [course?.modules]);

  const getModuleQuestions = useMemo(() => {
    const modules = course?.modules ?? [];
    return (moduleId) => {
      if (moduleId === FINAL_TEST_MODULE_ID) return finalTestQuestions;
      const mod = modules.find((m) => String(m.moduleId) === String(moduleId));
      return Array.isArray(mod?.questionBank) ? mod.questionBank : [];
    };
  }, [course?.modules, finalTestQuestions]);

  const enabledLessonKeys = useMemo(() => {
    const set = new Set();
    displayModules.forEach((mod) => {
      if (mod.moduleId === FINAL_TEST_MODULE_ID) {
        set.add("final-test");
        return;
      }
      const lessons = mod.lessons || [];
      lessons.forEach((lesson, index) => {
        const enabled =
          index === 0 || (lessons[index - 1] && lessons[index - 1].completed === true);
        if (enabled) set.add(`${mod.moduleId}-${lesson.lessonId}`);
      });
      if (mod.allLessonsCompleted && lessons.length > 0) set.add(`test-${mod.moduleId}`);
    });
    return set;
  }, [displayModules]);

  const handleAccordionSelect = (key) => {
    if (key == null || enabledLessonKeys.has(key)) setActiveLessonKey(key);
  };

  /** Obtiene los datos completos de la lección (videoUrl, lessonDescription) desde el curso. */
  const getLessonDetails = useMemo(() => {
    const modules = course?.modules ?? [];
    return (moduleId, lessonId) => {
      const mod = modules.find((m) => String(m.moduleId) === String(moduleId));
      const lesson = mod?.lessons?.find((l) => String(l.lessonId) === String(lessonId));
      return lesson ?? null;
    };
  }, [course?.modules]);

  const handleToggleCompleted = async (moduleId, lessonId, currentCompleted) => {
    const key = `${moduleId}-${lessonId}`;
    const userId = user?.id ?? user?._id;
    if (!userId || !courseId) return;
    setUpdatingLessonKey(key);
    try {
      const res = await apiService.updateUserLessonProgress(
        userId,
        courseId,
        moduleId,
        lessonId,
        !currentCompleted
      );
      if (res?.status === "success") {
        await refreshUser();
      }
    } finally {
      setUpdatingLessonKey(null);
    }
  };

  const startQuiz = async (moduleId) => {
    const questions = getModuleQuestions(moduleId);
    if (questions.length === 0) return;
    const userId = user?.id ?? user?._id;
    if (userId && courseId) {
      try {
        if (moduleId === FINAL_TEST_MODULE_ID) {
          const res = await apiService.startFinalTestAttempt(userId, courseId);
          if (res?.status === "success") await refreshUser();
        } else {
          const res = await apiService.startModuleTestAttempt(userId, courseId, moduleId);
          if (res?.status === "success") await refreshUser();
        }
      } catch (_) {}
    }
    const totalMs = questions.length * QUIZ_MINUTES_PER_QUESTION * 60 * 1000;
    setActiveLessonKey(moduleId === FINAL_TEST_MODULE_ID ? "final-test" : `test-${moduleId}`);
    setQuizState({
      moduleId,
      step: "question",
      questionIndex: 0,
      answers: {},
      startTime: Date.now(),
      timeRemainingMs: totalMs,
    });
  };

  const computeScoreFromAnswers = useCallback((moduleId, answers) => {
    const questions = getModuleQuestions(moduleId);
    let correct = 0;
    questions.forEach((q) => {
      const selectedOptionId = answers[q.questionId];
      const correctOption = q.options?.find((o) => o.isCorrect);
      if (correctOption && selectedOptionId === correctOption.optionId) correct++;
    });
    return questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  }, [getModuleQuestions]);

  const closeQuiz = () => {
    quizResultSentRef.current = false;
    if (quizTimerIdRef.current) {
      clearInterval(quizTimerIdRef.current);
      quizTimerIdRef.current = null;
    }
    setQuizTimerId(null);
    setQuizState({ moduleId: null, step: "idle", questionIndex: 0, answers: {}, startTime: null, timeRemainingMs: null });
  };

  const submitQuizAnswer = (questionId, optionId) => {
    setQuizState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: optionId },
    }));
  };

  const submitQuizAndShowResult = useCallback(() => {
    const state = quizStateRef.current;
    if (state.moduleId == null) return;
    if (quizTimerIdRef.current) {
      clearInterval(quizTimerIdRef.current);
      quizTimerIdRef.current = null;
    }
    setQuizTimerId(null);
    const score = computeScoreFromAnswers(state.moduleId, state.answers);
    const userId = user?.id ?? user?._id;
    if (userId && courseId) {
      if (state.moduleId === FINAL_TEST_MODULE_ID) {
        apiService
          .updateFinalTestResult(userId, courseId, score)
          .then((res) => { if (res?.status === "success") refreshUser(); })
          .catch(() => {});
      } else {
        apiService
          .updateModuleTestResult(userId, courseId, state.moduleId, score)
          .then((res) => { if (res?.status === "success") refreshUser(); })
          .catch(() => {});
      }
    }
    if (state.moduleId !== FINAL_TEST_MODULE_ID) {
      setModuleTestResults((prev) => ({ ...prev, [state.moduleId]: score }));
      try {
        localStorage.setItem("cursoVistaModuleTestResults", JSON.stringify({ ...moduleTestResults, [state.moduleId]: score }));
      } catch (_) {}
    }
    quizResultSentRef.current = true;
    setQuizState((prev) => ({ ...prev, step: "result", score }));
  }, [courseId, user?.id, user?._id, refreshUser, computeScoreFromAnswers, moduleTestResults]);

  const handleFinishQuizClick = useCallback(() => {
    Swal.fire({
      title: "¿Enviar intento?",
      text: "¿Está seguro que desea enviar el intento? Una vez enviado no podrá modificar las respuestas.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Cancelar",
      background: "#082b55",
      color: "#ffffff",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "custom-swal-button",
      },
    }).then((result) => {
      if (result.isConfirmed) submitQuizAndShowResult();
    });
  }, [submitQuizAndShowResult]);

  useEffect(() => {
    if (quizState.step !== "question" || quizState.moduleId == null) return;
    const id = setInterval(() => {
      setQuizState((prev) => {
        const next = prev.timeRemainingMs - 1000;
        if (next <= 0) {
          const questions = getModuleQuestions(prev.moduleId);
          let correct = 0;
          questions.forEach((q) => {
            const selectedOptionId = prev.answers[q.questionId];
            const correctOption = q.options?.find((o) => o.isCorrect);
            if (correctOption && selectedOptionId === correctOption.optionId) correct++;
          });
          const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
          return { ...prev, step: "result", score, timeRemainingMs: 0 };
        }
        return { ...prev, timeRemainingMs: next };
      });
    }, 1000);
    quizTimerIdRef.current = id;
    setQuizTimerId(id);
    return () => {
      clearInterval(id);
      quizTimerIdRef.current = null;
      setQuizTimerId(null);
    };
  }, [quizState.moduleId, quizState.step]);

  const quizResultShownRef = useRef(false);
  useEffect(() => {
    if (quizState.step !== "result" || quizState.moduleId == null || quizState.score == null) return;
    if (quizResultShownRef.current) return;
    quizResultShownRef.current = true;
    const passed = (quizState.score ?? 0) >= QUIZ_MIN_PASS_PERCENT;
    Swal.fire({
      title: passed ? "Prueba aprobada" : "Prueba no aprobada",
      html: `Puntaje obtenido: <strong class="text-orange">${quizState.score}%</strong>${passed ? ". Has alcanzado el mínimo requerido." : `. El mínimo para aprobar es ${QUIZ_MIN_PASS_PERCENT}%.`}`,
      icon: passed ? "success" : "info",
      confirmButtonText: "Cerrar",
      background: "#082b55",
      color: "#ffffff",
      customClass: { confirmButton: "custom-swal-button" },
    }).then(() => {
      quizResultShownRef.current = false;
      closeQuiz();
    });
  }, [quizState.step, quizState.moduleId, quizState.score]);

  useEffect(() => {
    if (quizState.step !== "result" || quizState.moduleId == null || quizState.score == null) return;
    if (quizState.moduleId !== FINAL_TEST_MODULE_ID) {
      const newResults = { ...moduleTestResults, [quizState.moduleId]: quizState.score };
      setModuleTestResults(newResults);
      try {
        localStorage.setItem("cursoVistaModuleTestResults", JSON.stringify(newResults));
      } catch (_) {}
    }
    const userId = user?.id ?? user?._id;
    if (!quizResultSentRef.current && userId && courseId) {
      quizResultSentRef.current = true;
      if (quizState.moduleId === FINAL_TEST_MODULE_ID) {
        apiService
          .updateFinalTestResult(userId, courseId, quizState.score)
          .then((res) => { if (res?.status === "success") refreshUser(); })
          .catch(() => {});
      } else {
        apiService
          .updateModuleTestResult(userId, courseId, quizState.moduleId, quizState.score)
          .then((res) => {
            if (res?.status === "success") refreshUser();
          })
          .catch(() => {});
      }
    }
  }, [quizState.step, quizState.moduleId, quizState.score, user?.id, user?._id, courseId, refreshUser]);

  useEffect(() => {
    if (!courseId) return;
    if (hasPurchasedCourse) {
      let cancelled = false;
      apiService.getCourseByCourseId(courseId).then((res) => {
        if (!cancelled && res.status === "success" && res.payload) setCourse(res.payload);
      });
      return () => { cancelled = true; };
    }
    let cancelled = false;
    apiService.getCourseByCourseId(courseId).then((res) => {
      if (!cancelled && res.status === "success" && res.payload) setCourse(res.payload);
    });
    return () => { cancelled = true; };
  }, [courseId, hasPurchasedCourse]);

  /** Módulo en índice i está habilitado si es el primero o si el anterior tiene al menos un intento de prueba realizado. */
  const isModuleEnabled = (modIndex) =>
    modIndex === 0 || getModuleTestAttempts(displayModules[modIndex - 1]?.moduleId) >= 1;

  const requestModuleChange = (moduleId, lessonKey = null) => {
    const currentId = displayModules.find((m) => m.moduleId === selectedModuleId)?.moduleId ?? displayModules[0]?.moduleId;
    if (moduleId === currentId) {
      if (lessonKey != null) {
        setActiveLessonKey(lessonKey);
        setExpandedModuleId(moduleId);
      }
      return;
    }
    if (transitionLeaving) return;
    setPendingModuleId(moduleId);
    setPendingLessonKey(lessonKey);
    setTransitionLeaving(true);
  };

  useEffect(() => {
    if (!transitionLeaving || pendingModuleId == null) return;
    const t = setTimeout(() => {
      setSelectedModuleId(pendingModuleId);
      setActiveLessonKey(pendingLessonKey ?? null);
      setTransitionLeaving(false);
      setPendingModuleId(null);
      setPendingLessonKey(null);
    }, 220);
    return () => clearTimeout(t);
  }, [transitionLeaving, pendingModuleId, pendingLessonKey]);

  const handleModuleClick = (moduleId, modIndex) => {
    if (!isModuleEnabled(modIndex)) return;
    requestModuleChange(moduleId);
    setExpandedModuleId((prev) => (prev === moduleId ? null : moduleId));
  };

  const handleLessonDotClick = (moduleId, lessonId) => {
    const key = `${moduleId}-${lessonId}`;
    if (!enabledLessonKeys.has(key)) return;
    if (selectedModuleId === moduleId) {
      setExpandedModuleId(moduleId);
      setActiveLessonKey(key);
      return;
    }
    setExpandedModuleId(moduleId);
    requestModuleChange(moduleId, key);
  };

  const handleTestDotClick = (moduleId) => {
    const key = `test-${moduleId}`;
    if (!enabledLessonKeys.has(key)) return;
    if (selectedModuleId === moduleId) {
      setActiveLessonKey(key);
      return;
    }
    setExpandedModuleId(moduleId);
    requestModuleChange(moduleId, key);
  };

  const handleFinalTestDotClick = () => {
    if (!enabledLessonKeys.has("final-test")) return;
    if (selectedModuleId === FINAL_TEST_MODULE_ID) {
      setActiveLessonKey("final-test");
      return;
    }
    setExpandedModuleId(FINAL_TEST_MODULE_ID);
    requestModuleChange(FINAL_TEST_MODULE_ID, "final-test");
  };

  const expandedModule = displayModules.find((m) => m.moduleId === expandedModuleId);
  const displayedModule = displayModules.find((m) => m.moduleId === selectedModuleId) ?? displayModules[0];
  const displayedModuleIndex = displayedModule ? displayModules.indexOf(displayedModule) : 0;

  if (!user) {
    return null;
  }

  if (!hasPurchasedCourse) {
    const courseName = (course?.courseName || course?.name || "este curso").toUpperCase();
    return (
      <div className="container curso-vista-container">
        <FadeIn>
          <div className="curso-vista-no-comprado">
            <i className="bi bi-x-circle-fill text-danger mb-3 display-6"></i>
            <h3 className="text-orange my-3">Acceso al curso</h3>
            <p className="text-white mb-4">
              Para acceder al contenido del curso <strong>{courseName}</strong>, y realizar los módulos, lecciones y pruebas, te invitamos a informarte sobre los detalles y realizar la compra del mismo.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <Link to={`/course/${courseId}`} className="btn btn-warning">
                Ver detalles
              </Link>
              <button
                type="button"
                className="btn btn-outline-warning"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left-circle me-2"></i>
                Volver
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="container mt-5 curso-vista-layout">
      <FadeIn>
        {/* Vista mobile: 2 líneas horizontales (módulos arriba, lecciones abajo al tocar un módulo) */}
        <div className="curso-vista-mobile-progress d-md-none text-white mb-4">
          <div className="curso-vista-mobile-track">
            {displayModules.length === 0 && (course || userCourse) && (
              <div className="text-center py-2">
                <div className="spinner-border text-warning spinner-border-sm" role="status" />
              </div>
            )}
            {displayModules.length > 0 && (
              <>
                <div className="curso-vista-mobile-row curso-vista-mobile-modules">
                  <div className="curso-vista-mobile-line-h" aria-hidden="true" />
                  {displayModules.map((mod, modIndex) => {
                    const moduleEnabled = isModuleEnabled(modIndex);
                    if (mod.moduleId === FINAL_TEST_MODULE_ID) {
                      return (
                        <OverlayTrigger
                          key="final-test"
                          trigger="hover"
                          placement="top"
                          overlay={
                            <Popover className="curso-vista-popover">
                              <Popover.Body>Prueba final del curso</Popover.Body>
                            </Popover>
                          }
                        >
                          <button
                            type="button"
                            className={`curso-vista-module-dot ${getModuleTestScore(FINAL_TEST_MODULE_ID) != null ? "completed" : ""} ${expandedModuleId === FINAL_TEST_MODULE_ID ? "expanded" : ""} ${!moduleEnabled ? "disabled" : ""}`}
                            onClick={() => { if (!moduleEnabled) return; setExpandedModuleId(FINAL_TEST_MODULE_ID); requestModuleChange(FINAL_TEST_MODULE_ID, "final-test"); }}
                            disabled={!moduleEnabled}
                            aria-expanded={expandedModuleId === FINAL_TEST_MODULE_ID}
                            aria-label="Prueba final del curso"
                          />
                        </OverlayTrigger>
                      );
                    }
                    return (
                      <OverlayTrigger
                        key={mod.moduleId}
                        trigger="hover"
                        placement="top"
                        overlay={
                          <Popover className="curso-vista-popover">
                            <Popover.Body>{mod.moduleName}</Popover.Body>
                          </Popover>
                        }
                      >
                        <button
                          type="button"
                          className={`curso-vista-module-dot ${mod.allLessonsCompleted ? "completed" : ""} ${expandedModuleId === mod.moduleId ? "expanded" : ""} ${!moduleEnabled ? "disabled" : ""}`}
                          onClick={() => handleModuleClick(mod.moduleId, modIndex)}
                          disabled={!moduleEnabled}
                          aria-expanded={expandedModuleId === mod.moduleId}
                          aria-label={`Módulo: ${mod.moduleName}`}
                        />
                      </OverlayTrigger>
                    );
                  })}
                </div>
                {expandedModule && expandedModule.moduleId !== FINAL_TEST_MODULE_ID && (
                  <div className="curso-vista-mobile-row curso-vista-mobile-lessons">
                    <div className="curso-vista-mobile-line-h" aria-hidden="true" />
                    {(expandedModule.lessons || []).map((lesson, lessonIndex) => {
                      const lessonEnabled = lessonIndex === 0 || (expandedModule.lessons[lessonIndex - 1]?.completed === true);
                      return (
                        <OverlayTrigger
                          key={lesson.lessonId}
                          trigger="hover"
                          placement="top"
                          overlay={
                            <Popover className="curso-vista-popover">
                              <Popover.Body>{lesson.lessonName}</Popover.Body>
                            </Popover>
                          }
                        >
                          <button
                            type="button"
                            className={`curso-vista-lesson-dot ${lesson.completed ? "completed" : ""} ${!lessonEnabled ? "disabled" : ""}`}
                            onClick={() => handleLessonDotClick(expandedModule.moduleId, lesson.lessonId)}
                            disabled={!lessonEnabled}
                            aria-label={lesson.lessonName}
                          />
                        </OverlayTrigger>
                      );
                    })}
                    {expandedModule.lessons?.length > 0 && (
                      <OverlayTrigger
                        trigger="hover"
                        placement="top"
                        overlay={
                          <Popover className="curso-vista-popover">
                            <Popover.Body>Prueba parcial</Popover.Body>
                          </Popover>
                        }
                      >
                        <button
                          type="button"
                          className={`curso-vista-lesson-dot ${getModuleTestScore(expandedModule.moduleId) != null ? "completed" : ""} ${!enabledLessonKeys.has(`test-${expandedModule.moduleId}`) ? "disabled" : ""}`}
                          onClick={() => handleTestDotClick(expandedModule.moduleId)}
                          disabled={!enabledLessonKeys.has(`test-${expandedModule.moduleId}`)}
                          aria-label="Prueba parcial"
                        />
                      </OverlayTrigger>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Banner: misma imagen que detalles del curso, 50% opacidad, nombre centrado */}
        {(course?.bannerUrl || course?.image) && (
          <div className="curso-vista-banner">
            <div
              className="curso-vista-banner-bg"
              style={{ backgroundImage: `url(${course.bannerUrl || course.image})` }}
              aria-hidden="true"
            />
            <div className="curso-vista-banner-text">
              <h1 className="curso-vista-banner-title">
                {(course?.courseName || course?.name || "").toUpperCase()}
              </h1>
              {course?.professor?.[0] && (
                <div className="curso-vista-banner-instructor-wrap">
                  <p className="curso-vista-banner-instructor">
                    por {[course.professor[0].firstName, course.professor[0].lastName].filter(Boolean).join(" ")}
                  </p>
                  {course.professor[0].profession && (
                    <p className="curso-vista-banner-instructor-profession">{course.professor[0].profession}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="curso-vista-row d-flex flex-wrap">
          {/* Sidebar: izquierda en desktop */}
          <aside className="curso-vista-sidebar text-white col-12 col-md-2 d-none d-md-flex flex-column justify-content-between mb-5 mb-md-0">
            <div className="curso-vista-sidebar-content">
              <div className="curso-vista-progress-track">
                <div className="curso-vista-line-v" aria-hidden="true" />
                {displayModules.length === 0 && (course || userCourse) && (
                  <div className="text-center py-3">
                    <div className="spinner-border text-warning spinner-border-sm" role="status" />
                    <p className="small text-white-50 mt-2 mb-0">Cargando módulos...</p>
                  </div>
                )}
                {displayModules.map((mod, modIndex) => {
                  const moduleEnabled = isModuleEnabled(modIndex);
                  if (mod.moduleId === FINAL_TEST_MODULE_ID) {
                    return (
                      <div key="final-test" className="curso-vista-module-block">
                        <OverlayTrigger
                          trigger="hover"
                          placement="right"
                          overlay={
                            <Popover className="curso-vista-popover">
                              <Popover.Body>Prueba final del curso</Popover.Body>
                            </Popover>
                          }
                        >
                          <button
                            type="button"
                            className={`curso-vista-module-dot ${getModuleTestScore(FINAL_TEST_MODULE_ID) != null ? "completed" : ""} ${expandedModuleId === FINAL_TEST_MODULE_ID ? "expanded" : ""} ${!moduleEnabled ? "disabled" : ""}`}
                            onClick={() => { if (!moduleEnabled) return; setExpandedModuleId(FINAL_TEST_MODULE_ID); requestModuleChange(FINAL_TEST_MODULE_ID, "final-test"); }}
                            disabled={!moduleEnabled}
                            aria-expanded={expandedModuleId === FINAL_TEST_MODULE_ID}
                            aria-label="Prueba final del curso"
                          />
                        </OverlayTrigger>
                        <div className={`curso-vista-lesson-dots ${expandedModuleId === FINAL_TEST_MODULE_ID ? "expanded" : ""}`} />
                      </div>
                    );
                  }
                  return (
                    <div key={mod.moduleId} className="curso-vista-module-block">
                      <OverlayTrigger
                        trigger="hover"
                        placement="right"
                        overlay={
                          <Popover className="curso-vista-popover">
                            <Popover.Body>{mod.moduleName}</Popover.Body>
                          </Popover>
                        }
                      >
                        <button
                          type="button"
                          className={`curso-vista-module-dot ${mod.allLessonsCompleted ? "completed" : ""} ${expandedModuleId === mod.moduleId ? "expanded" : ""} ${!moduleEnabled ? "disabled" : ""}`}
                          onClick={() => handleModuleClick(mod.moduleId, modIndex)}
                          disabled={!moduleEnabled}
                          aria-expanded={expandedModuleId === mod.moduleId}
                          aria-label={`Módulo: ${mod.moduleName}`}
                        />
                      </OverlayTrigger>
                      <div
                        className={`curso-vista-lesson-dots ${expandedModuleId === mod.moduleId ? "expanded" : ""}`}
                      >
                        {(mod.lessons || []).map((lesson, lessonIndex) => {
                          const lessonEnabled = lessonIndex === 0 || (mod.lessons[lessonIndex - 1]?.completed === true);
                          return (
                            <OverlayTrigger
                              key={lesson.lessonId}
                              trigger="hover"
                              placement="right"
                              overlay={
                                <Popover className="curso-vista-popover">
                                  <Popover.Body>{lesson.lessonName}</Popover.Body>
                                </Popover>
                              }
                            >
                              <button
                                type="button"
                                className={`curso-vista-lesson-dot ${lesson.completed ? "completed" : ""} ${!lessonEnabled ? "disabled" : ""}`}
                                onClick={() => handleLessonDotClick(mod.moduleId, lesson.lessonId)}
                                disabled={!lessonEnabled}
                                aria-label={lesson.lessonName}
                              />
                            </OverlayTrigger>
                          );
                        })}
                        {mod.lessons?.length > 0 && (
                          <OverlayTrigger
                            trigger="hover"
                            placement="right"
                            overlay={
                              <Popover className="curso-vista-popover">
                                <Popover.Body>Prueba parcial</Popover.Body>
                              </Popover>
                            }
                          >
                            <button
                              type="button"
                              className={`curso-vista-lesson-dot ${getModuleTestScore(mod.moduleId) != null ? "completed" : ""} ${!enabledLessonKeys.has(`test-${mod.moduleId}`) ? "disabled" : ""}`}
                              onClick={() => handleTestDotClick(mod.moduleId)}
                              disabled={!enabledLessonKeys.has(`test-${mod.moduleId}`)}
                              aria-label="Prueba parcial"
                            />
                          </OverlayTrigger>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="curso-vista-sidebar-logo text-center w-100">
              <a href="#goToTop" aria-label="Ir al tope">
                <img className="img-fluid curso-vista-logo-img" src="/latiasImgLogo.png" alt="Latias" />
              </a>
            </div>
          </aside>
          <section className="curso-vista-main col-12 col-md-10">
            {displayModules.length === 0 && (course || userCourse) && (
              <div className="text-center py-4">
                <div className="spinner-border text-warning" role="status" />
                <p className="text-white-50 mt-2 mb-0">Cargando contenido...</p>
              </div>
            )}
            {displayModules.length > 0 && displayedModule && (() => {
              const mod = displayedModule;
              const moduleIndex = displayedModuleIndex;
              const lessons = mod.lessons || [];
              const isLessonEnabled = (index) =>
                index === 0 || (lessons[index - 1] && lessons[index - 1].completed === true);
              const allCompleted = mod.allLessonsCompleted && lessons.length > 0;
              const hasNextModule = moduleIndex < displayModules.length - 1;
              const nextModule = hasNextModule ? displayModules[moduleIndex + 1] : null;
              const hasPrevModule = moduleIndex > 0;
              const prevModule = hasPrevModule ? displayModules[moduleIndex - 1] : null;
              const isFinalTestModule = mod.moduleId === FINAL_TEST_MODULE_ID;
              if (isFinalTestModule) {
                return (
                  <div
                    key={mod.moduleId}
                    id="curso-vista-module-final"
                    className={`curso-vista-module-content mb-4 ${transitionLeaving ? "curso-vista-module-fade-out" : "curso-vista-module-fade-in"}`}
                  >
                    <h2 className="text-orange curso-vista-module-title mb-3">
                      Prueba final del curso
                    </h2>
                    <Accordion
                      activeKey={enabledLessonKeys.has(activeLessonKey) ? activeLessonKey : null}
                      onSelect={handleAccordionSelect}
                      className="curso-vista-lessons-accordion"
                    >
                      <Accordion.Item eventKey="final-test" className="curso-vista-quiz-accordion-item">
                        <Accordion.Header className="curso-vista-quiz-accordion-header">
                          <span className="d-flex w-100 justify-content-between align-items-center me-2">
                            <span>
                              Prueba final del curso
                              {getModuleTestScore(FINAL_TEST_MODULE_ID) != null && (
                                <span className="curso-vista-lesson-check ms-2" aria-hidden="true">
                                  <i className="bi bi-check-circle-fill text-success" />
                                </span>
                              )}
                            </span>
                            {quizState.moduleId === FINAL_TEST_MODULE_ID && quizState.step === "question" && (
                              <span className="text-warning fw-semibold curso-vista-quiz-header-timer">
                                {(() => {
                                  const ms = quizState.timeRemainingMs ?? 0;
                                  const m = Math.floor(ms / 60000);
                                  const s = Math.floor((ms % 60000) / 1000);
                                  return `Tiempo: ${m}:${s.toString().padStart(2, "0")}`;
                                })()}
                              </span>
                            )}
                          </span>
                        </Accordion.Header>
                        <Accordion.Body>
                          {quizState.moduleId === FINAL_TEST_MODULE_ID && quizState.step === "question" ? (
                            <div className="curso-vista-quiz-inline">
                              <p className="text-orange fw-bold mb-3">
                                Intento {getModuleTestAttempts(FINAL_TEST_MODULE_ID)} de 2
                              </p>
                              {(getModuleQuestions(FINAL_TEST_MODULE_ID) || []).map((q, idx) => (
                                <div key={q.questionId} className="curso-vista-quiz-question-block mb-4">
                                  <p className="text-white fw-semibold mb-2">
                                    {idx + 1}. {q.questionText}
                                  </p>
                                  <div className="d-flex flex-column gap-2 ps-3">
                                    {(q.options || []).map((opt) => (
                                      <label
                                        key={opt.optionId}
                                        className={`d-flex align-items-center p-2 rounded cursor-pointer ${quizState.answers[q.questionId] === opt.optionId ? "bg-warning bg-opacity-25" : ""}`}
                                      >
                                        <input
                                          type="radio"
                                          name={`q-${q.questionId}`}
                                          checked={quizState.answers[q.questionId] === opt.optionId}
                                          onChange={() => submitQuizAnswer(q.questionId, opt.optionId)}
                                          className="me-2"
                                        />
                                        <span className="text-white-50">{opt.optionText}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              <div className="mt-4 pt-3 border-top border-secondary">
                                <Button className="btn-warning" onClick={handleFinishQuizClick}>
                                  Finalizar intento
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="curso-vista-quiz-intro">
                              <p className="curso-vista-quiz-rules-title text-white mb-2">Datos generales de la prueba:</p>
                              <ul className="curso-vista-quiz-rules text-white-50 mb-3">
                                <li>La prueba es de <strong className="text-white">opción múltiple</strong>.</li>
                                <li>Solo <strong className="text-white">una respuesta</strong> correcta por pregunta.</li>
                                <li>Dispones de <strong className="text-white">dos intentos</strong> para realizarla.</li>
                                <li>El porcentaje mínimo de aprobación es del <strong className="text-warning">{QUIZ_MIN_PASS_PERCENT}%</strong>.</li>
                                <li>Se calculará <strong className="text-white">dos minutos</strong> por pregunta.</li>
                                <li>Si cierras o actualizas la página antes de finalizar, <strong className="text-white">se considerará como un intento finalizado</strong>.</li>
                                <li>Se tomará el intento con <strong className="text-white">mayor puntaje obtenido</strong>.</li>
                              </ul>
                              {getModuleTestScore(FINAL_TEST_MODULE_ID) != null ? (
                                <p className="curso-vista-quiz-score text-orange mb-3">
                                  Puntaje obtenido: <strong>{getModuleTestScore(FINAL_TEST_MODULE_ID)}%</strong>
                                </p>
                              ) : null}
                              {getModuleTestAttempts(FINAL_TEST_MODULE_ID) < 2 && (getModuleQuestions(FINAL_TEST_MODULE_ID) || []).length > 0 && (
                                <Button
                                  className="btn-warning"
                                  onClick={() => startQuiz(FINAL_TEST_MODULE_ID)}
                                >
                                  Comenzar prueba {getModuleTestAttempts(FINAL_TEST_MODULE_ID) >= 1 && `(Intento ${getModuleTestAttempts(FINAL_TEST_MODULE_ID) + 1} de 2)`}
                                </Button>
                              )}
                              {(getModuleQuestions(FINAL_TEST_MODULE_ID) || []).length === 0 && (
                                <p className="text-white-50 fst-italic mb-0">No hay preguntas disponibles para la prueba final.</p>
                              )}
                            </div>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <div className="curso-vista-module-nav-wrap">
                      <div className="curso-vista-module-nav-left">
                        {hasPrevModule && prevModule && (
                          <Button
                            variant="outline-warning"
                            className="curso-vista-module-nav-btn"
                            onClick={() => { requestModuleChange(prevModule.moduleId); setExpandedModuleId(prevModule.moduleId); setActiveLessonKey(prevModule.lessons?.length ? `test-${prevModule.moduleId}` : null); }}
                          >
                            Módulo anterior
                          </Button>
                        )}
                      </div>
                      <div className="curso-vista-module-nav-right">
                        {getModuleTestScore(FINAL_TEST_MODULE_ID) != null && (
                          <Button
                            variant="outline-warning"
                            className="curso-vista-module-nav-btn"
                            onClick={() => setShowSummaryModal(true)}
                          >
                            Ver resumen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={mod.moduleId}
                  id={`curso-vista-module-${moduleIndex}`}
                  className={`curso-vista-module-content mb-4 ${transitionLeaving ? "curso-vista-module-fade-out" : "curso-vista-module-fade-in"}`}
                >
                  <p className="mb-0 text-white-50">Módulo N°{moduleIndex + 1}: </p>
                  <h2 className="text-orange curso-vista-module-title">
                    {mod.moduleName}
                  </h2>
                  <p className="curso-vista-module-description text-white">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla facilisi. Ut convallis, sem sit amet interdum consectetuer, odio augue aliquam leo, at dapibus tortor risus nec lectus.
                  </p>
                  <Accordion
                    activeKey={enabledLessonKeys.has(activeLessonKey) ? activeLessonKey : null}
                    onSelect={handleAccordionSelect}
                    className="curso-vista-lessons-accordion"
                  >
                    {lessons.map((lesson, index) => {
                      const enabled = isLessonEnabled(index);
                      const eventKey = `${mod.moduleId}-${lesson.lessonId}`;
                      return (
                        <Accordion.Item
                          key={lesson.lessonId}
                          eventKey={eventKey}
                          disabled={!enabled}
                          className={!enabled ? "curso-vista-lesson-disabled" : ""}
                        >
                          <Accordion.Header>
                            <span className="text-white-50">Lección N°{index + 1}: </span> <strong className="ms-2">{lesson.lessonName}</strong>
                            {lesson.completed && (
                              <span className="curso-vista-lesson-check ms-2" aria-hidden="true">
                                <i className="bi bi-check-circle-fill text-success" />
                              </span>
                            )}
                          </Accordion.Header>
                          <Accordion.Body>
                            <div className="curso-vista-lesson-body">
                              <div className="curso-vista-lesson-video">
                                {getLessonDetails(mod.moduleId, lesson.lessonId)?.videoUrl ? (
                                  <div className="ratio ratio-16x9">
                                    <iframe
                                      src={getLessonDetails(mod.moduleId, lesson.lessonId).videoUrl}
                                      title={lesson.lessonName}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  </div>
                                ) : (
                                  <div className="curso-vista-lesson-video-placeholder">
                                    <i className="bi bi-camera-video text-white-50" />
                                    <span className="text-white-50 small">Sin video</span>
                                  </div>
                                )}
                              </div>
                              <div className="curso-vista-lesson-sidebar">
                                <div className="curso-vista-lesson-title text-orange fw-bold">{lesson.lessonName}</div>
                                <div className="curso-vista-lesson-description">
                                  {getLessonDetails(mod.moduleId, lesson.lessonId)?.lessonDescription ?? (
                                    <span className="text-white-50 fst-italic">Sin descripción.</span>
                                  )}
                                </div>
                                <button
                                    type="button"
                                    className={`btn ${lesson.completed ? "btn-outline-warning" : "btn-warning"} curso-vista-btn-completed`}
                                    onClick={() => handleToggleCompleted(mod.moduleId, lesson.lessonId, lesson.completed)}
                                    disabled={updatingLessonKey === `${mod.moduleId}-${lesson.lessonId}`}
                                  >
                                    {updatingLessonKey === `${mod.moduleId}-${lesson.lessonId}` ? (
                                      <span className="spinner-border me-1" role="status" aria-hidden="true" />
                                    ) : lesson.completed ? (
                                      <i className="bi bi-check-circle me-1" />
                                    ) : null}
                                    {lesson.completed ? "Desmarcar completada" : "Completada"}
                                  </button>
                                </div>
                              </div>
                              <div className="curso-vista-ayudas">
                                <h3 className="curso-vista-ayudas-title text-orange">Ayudas al navegante</h3>
                                {(() => {
                                  const details = getLessonDetails(mod.moduleId, lesson.lessonId);
                                  const files = details?.lessonFiles ?? details?.attachments ?? [];
                                  const hasFiles = Array.isArray(files) && files.length > 0;
                                  return hasFiles ? (
                                    <ul className="curso-vista-ayudas-list">
                                      {files.map((file, i) => {
                                        const url = typeof file === "string" ? file : file?.url;
                                        const label = typeof file === "string" ? `Documento ${i + 1}` : (file?.name ?? file?.label ?? `Documento ${i + 1}`);
                                        return url ? (
                                          <li key={i}>
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="curso-vista-ayudas-link">
                                              <i className="bi bi-file-earmark-arrow-down me-2" />
                                              {label}
                                            </a>
                                          </li>
                                        ) : null;
                                      })}
                                    </ul>
                                  ) : (
                                    <p className="curso-vista-ayudas-empty">No hay documentos complementarios para esta lección.</p>
                                  );
                                })()}
                              </div>
                            </Accordion.Body>
                        </Accordion.Item>
                      );
                    })}
                    <Accordion.Item
                      eventKey={`test-${mod.moduleId}`}
                      disabled={!mod.allLessonsCompleted || (mod.lessons?.length === 0)}
                      className={!mod.allLessonsCompleted ? "curso-vista-lesson-disabled" : ""}
                    >
                      <Accordion.Header className="curso-vista-quiz-accordion-header">
                        <span className="d-flex w-100 justify-content-between align-items-center me-2">
                          <span>
                            Prueba parcial del Módulo N°{moduleIndex + 1}
                            {getModuleTestScore(mod.moduleId) != null && (
                              <span className="curso-vista-lesson-check ms-2" aria-hidden="true">
                                <i className="bi bi-check-circle-fill text-success" />
                              </span>
                            )}
                          </span>
                          {quizState.moduleId === mod.moduleId && quizState.step === "question" && (
                            <span className="text-warning fw-semibold curso-vista-quiz-header-timer">
                              {(() => {
                                const ms = quizState.timeRemainingMs ?? 0;
                                const m = Math.floor(ms / 60000);
                                const s = Math.floor((ms % 60000) / 1000);
                                return `Tiempo: ${m}:${s.toString().padStart(2, "0")}`;
                              })()}
                            </span>
                          )}
                        </span>
                      </Accordion.Header>
                      <Accordion.Body>
                        {quizState.moduleId === mod.moduleId && quizState.step === "question" ? (
                          <div className="curso-vista-quiz-inline">
                            <p className="text-orange fw-bold mb-3">
                              Intento {getModuleTestAttempts(mod.moduleId)} de 2
                            </p>
                            {(getModuleQuestions(mod.moduleId) || []).map((q, idx) => (
                              <div key={q.questionId} className="curso-vista-quiz-question-block mb-4">
                                <p className="text-white fw-semibold mb-2">
                                  {idx + 1}. {q.questionText}
                                </p>
                                <div className="d-flex flex-column gap-2 ps-3">
                                  {(q.options || []).map((opt) => (
                                    <label
                                      key={opt.optionId}
                                      className={`d-flex align-items-center p-2 rounded cursor-pointer ${quizState.answers[q.questionId] === opt.optionId ? "bg-warning bg-opacity-25" : ""}`}
                                    >
                                      <input
                                        type="radio"
                                        name={`q-${q.questionId}`}
                                        checked={quizState.answers[q.questionId] === opt.optionId}
                                        onChange={() => submitQuizAnswer(q.questionId, opt.optionId)}
                                        className="me-2"
                                      />
                                      <span className="text-white-50">{opt.optionText}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <div className="mt-4 pt-3 border-top border-secondary">
                              <Button className="btn-warning" onClick={handleFinishQuizClick}>
                                Finalizar intento
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="curso-vista-quiz-intro">
                            <p className="curso-vista-quiz-rules-title text-white mb-2">Datos generales de la prueba:</p>
                            <ul className="curso-vista-quiz-rules text-white-50 mb-3">
                              <li>La prueba es de <strong className="text-white">opción múltiple</strong>.</li>
                              <li>Solo <strong className="text-white">una respuesta</strong> correcta por pregunta.</li>
                              <li>Dispones de <strong className="text-white">dos intentos</strong> para realizarla.</li>
                              <li>El porcentaje mínimo de aprobación es del <strong className="text-warning">{QUIZ_MIN_PASS_PERCENT}%</strong>.</li>
                              <li>Se calculará <strong className="text-white">dos minutos</strong> por pregunta.</li>
                              <li>Si cierras o actualizas la página antes de finalizar, <strong className="text-white">se considerará como un intento finalizado</strong>.</li>
                              <li>Se tomará el intento con <strong className="text-white">mayor puntaje obtenido</strong>.</li>
                            </ul>
                            {getModuleTestScore(mod.moduleId) != null ? (
                              <p className="curso-vista-quiz-score text-orange mb-3">
                                Puntaje obtenido: <strong>{getModuleTestScore(mod.moduleId)}%</strong>
                              </p>
                            ) : null}
                            {getModuleTestAttempts(mod.moduleId) < 2 && getModuleQuestions(mod.moduleId).length > 0 && (
                              <Button
                                className="btn-warning"
                                onClick={() => startQuiz(mod.moduleId)}
                              >
                                Comenzar prueba {getModuleTestAttempts(mod.moduleId) >= 1 && `(Intento ${getModuleTestAttempts(mod.moduleId) + 1} de 2)`}
                              </Button>
                            )}
                            {getModuleTestScore(mod.moduleId) == null && getModuleQuestions(mod.moduleId).length === 0 && (
                              <p className="text-white-50 fst-italic mb-0">No hay preguntas disponibles para esta prueba.</p>
                            )}
                          </div>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                  <div className="curso-vista-module-nav-wrap">
                    <div className="curso-vista-module-nav-left">
                      {hasPrevModule && prevModule && (
                        <button
                          type="button"
                          className="btn btn-outline-warning curso-vista-btn-prev-module"
                          onClick={() => {
                            setExpandedModuleId(prevModule.moduleId);
                            requestModuleChange(prevModule.moduleId, null);
                          }}
                        >
                          Módulo anterior
                        </button>
                      )}
                    </div>
                    <div className="curso-vista-module-nav-right">
                      <button
                        type="button"
                        className="btn btn-outline-warning curso-vista-btn-next-module"
                        disabled={!hasNextModule}
                        onClick={() => {
                          if (nextModule) {
                            setExpandedModuleId(nextModule.moduleId);
                            requestModuleChange(nextModule.moduleId, null);
                          }
                        }}
                      >
                        Módulo siguiente
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
            {displayModules.length === 0 && !course && !userCourse && (
              <p className="curso-vista-placeholder text-white-50">
                No hay módulos cargados.
              </p>
            )}
          </section>
        </div>

        <Modal
          show={showSummaryModal}
          onHide={() => setShowSummaryModal(false)}
          centered
          className="curso-vista-summary-modal"
          contentClassName="curso-vista-summary-modal-content"
        >
          <Modal.Header closeButton closeVariant="white" className="curso-vista-summary-modal-header">
            <Modal.Title className="text-orange">Resumen del curso</Modal.Title>
          </Modal.Header>
          <Modal.Body className="curso-vista-summary-modal-body">
            <h6 className="text-white mb-2">Pruebas parciales</h6>
            <ul className="curso-vista-summary-list mb-3">
              {summaryData.partials.map((p, i) => (
                <li key={i} className="d-flex justify-content-between">
                  <span className="text-white-50">{p.moduleName}</span>
                  <span className="text-white">{p.score != null ? `${p.score}%` : "—"}</span>
                </li>
              ))}
            </ul>
            <p className="mb-1 text-white-50">
              Promedio pruebas parciales: <strong className="text-white">{summaryData.avgPartial != null ? `${summaryData.avgPartial}%` : "—"}</strong>
              {summaryData.avgPartial != null && (
                <span className="ms-1">(mínimo requerido: {PARTIAL_AVG_MIN}%)</span>
              )}
            </p>
            <p className="mb-3 text-white-50">
              Prueba final: <strong className="text-white">{summaryData.finalScore != null ? `${summaryData.finalScore}%` : "—"}</strong>
              <span className="ms-1">(mínimo requerido: {FINAL_TEST_MIN}%)</span>
            </p>
            <hr className="border-secondary" />
            {summaryData.passed ? (
              <div className="curso-vista-summary-verdict passed">
                <p className="text-success fw-bold mb-1">Curso aprobado</p>
                <p className="text-white-50 mb-0">
                  Nota final: <strong className="text-orange">{summaryData.finalGrade}%</strong>
                  <span className="d-block small mt-1">(60% prueba final + 40% promedio de pruebas parciales)</span>
                </p>
                <Button
                  variant="success"
                  className="mt-3"
                  onClick={() => { setShowSummaryModal(false); navigate(`/dashboard/certificados?course=${courseId}`); }}
                >
                  <i className="bi bi-award-fill me-2" />
                  Ver certificado
                </Button>
              </div>
            ) : (
              <div className="curso-vista-summary-verdict failed">
                <p className="text-danger fw-bold mb-2">Curso reprobado</p>
                <p className="text-white-50 mb-0">
                  {summaryData.avgPartial != null && summaryData.avgPartial < PARTIAL_AVG_MIN && summaryData.finalScore != null && summaryData.finalScore < FINAL_TEST_MIN && (
                    <>No se alcanzó el promedio mínimo de pruebas parciales ({PARTIAL_AVG_MIN}%) ni el mínimo de la prueba final ({FINAL_TEST_MIN}%). Deberá recursar el curso.</>
                  )}
                  {summaryData.avgPartial != null && summaryData.avgPartial < PARTIAL_AVG_MIN && (summaryData.finalScore == null || summaryData.finalScore >= FINAL_TEST_MIN) && (
                    <>No se alcanzó el promedio mínimo de las pruebas parciales ({PARTIAL_AVG_MIN}%). Deberá recursar el curso.</>
                  )}
                  {summaryData.finalScore != null && summaryData.finalScore < FINAL_TEST_MIN && (summaryData.avgPartial == null || summaryData.avgPartial >= PARTIAL_AVG_MIN) && (
                    <>No se alcanzó el mínimo requerido en la prueba final ({FINAL_TEST_MIN}%). Deberá recursar el curso.</>
                  )}
                  {summaryData.avgPartial == null && summaryData.finalScore != null && summaryData.finalScore < FINAL_TEST_MIN && (
                    <>No se alcanzó el mínimo requerido en la prueba final ({FINAL_TEST_MIN}%). Deberá recursar el curso.</>
                  )}
                  {summaryData.finalScore == null && summaryData.avgPartial != null && summaryData.avgPartial < PARTIAL_AVG_MIN && (
                    <>No se alcanzó el promedio mínimo de las pruebas parciales ({PARTIAL_AVG_MIN}%). Deberá recursar el curso.</>
                  )}
                  {!((summaryData.avgPartial != null && summaryData.avgPartial < PARTIAL_AVG_MIN) || (summaryData.finalScore != null && summaryData.finalScore < FINAL_TEST_MIN)) && (
                    <>No se alcanzaron los requisitos mínimos para aprobar. Deberá recursar el curso.</>
                  )}
                </p>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </FadeIn>
    </div>
  );
}
