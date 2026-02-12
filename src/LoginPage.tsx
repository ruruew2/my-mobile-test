import React, { useState, useEffect } from 'react';
import './Login.css';

const LoginPage = ({ onLoginSuccess }: { onLoginSuccess: (type?: string) => void }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'findPw'>('login');
    const [form, setForm] = useState({ id: '', pw: '', confirmPw: '', email: '', nick: '' });
    const [msg, setMsg] = useState({ id: '', pw: '', confirmPw: '', email: '' });
    const [toast, setToast] = useState('');
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (e.target.name === 'id') {
            setMsg({ ...msg, id: '' });
            setIsIdChecked(false);
        }
    };

    // 로그인 처리
    const handleLogin = () => {
        if (form.id === 'test' && form.pw === '1234') {
            onLoginSuccess(); // 일반 로그인
        } else {
            alert('아이디 또는 비밀번호를 확인해주세요.');
        }
    };

    // 아이디 중복 확인
    const checkDuplicateId = () => {
        if (!form.id) return alert('아이디를 입력해주세요.');
        if (form.id === 'test') {
            setMsg((prev) => ({ ...prev, id: '❌ 이미 사용 중인 아이디입니다.' }));
            setIsIdChecked(false);
        } else {
            setMsg((prev) => ({ ...prev, id: '✅ 사용 가능한 아이디입니다.' }));
            setIsIdChecked(true);
        }
    };

    // 회원가입 제출 (토스트를 여기서 띄우지 않고 다음 페이지로 넘깁니다)
    const handleSignupSubmit = () => {
        if (!isIdChecked) return alert('아이디 중복확인을 해주세요.');
        if (msg.pw.includes('❌') || !form.pw) return alert('비밀번호 규칙을 확인해주세요.');
        if (form.pw !== form.confirmPw) return alert('비밀번호가 일치하지 않습니다.');
        if (!form.email || msg.email.includes('❌')) return alert('올바른 이메일을 입력해주세요.');

        // 중요: 'welcome' 인자를 전달하여 다음 페이지에서 팝업이 뜨게 함
        onLoginSuccess('welcome');
    };

    useEffect(() => {
        if (mode !== 'signup') return;
        const pwValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(form.pw);
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
        setMsg((prev) => ({
            ...prev,
            pw: !form.pw ? '' : pwValid ? '✅ 안전한 비밀번호' : '❌ 숫자+문자 조합 6자 이상',
            confirmPw: !form.confirmPw ? '' : form.pw === form.confirmPw ? '✅ 일치합니다' : '❌ 불일치',
            email: !form.email ? '' : emailValid ? '✅ 올바른 형식' : '❌ 형식 오류',
        }));
    }, [form.pw, form.confirmPw, form.email, mode]);

    const LockIcon = () => (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#999"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            {showPw ? <path d="M7 11V7a5 5 0 0 1 9.9-1" /> : <path d="M7 11V7a5 5 0 0 1 10 0v4" />}
        </svg>
    );

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="logo">ART-LOG</h1>
                <p className="slogan">
                    {mode === 'login'
                        ? '예술적 순간의 기록'
                        : mode === 'signup'
                          ? '새로운 여정의 시작'
                          : '비밀번호 찾기'}
                </p>

                <div className="input-group">
                    {mode === 'login' && (
                        <>
                            <input name="id" placeholder="아이디" className="login-input" onChange={onChange} />
                            <div className="input-wrapper">
                                <input
                                    name="pw"
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="비밀번호"
                                    className="login-input"
                                    onChange={onChange}
                                />
                                <div className="pw-toggle-btn" onClick={() => setShowPw(!showPw)}>
                                    <LockIcon />
                                </div>
                            </div>
                            <button className="btn-main-login" onClick={handleLogin}>
                                로그인
                            </button>
                            <div className="divider">
                                <span>소셜 로그인</span>
                            </div>
                            <div className="social-icon-wrapper">
                                {['Google', 'Kakao', 'Naver'].map((p) => (
                                    <div
                                        key={p}
                                        className={`social-icon-item ${p.toLowerCase()}-bg`}
                                        onClick={() => onLoginSuccess()}
                                    >
                                        {p === 'Naver' ? (
                                            <span className="naver-text">N</span>
                                        ) : (
                                            <img
                                                src={
                                                    p === 'Google'
                                                        ? 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png'
                                                        : 'https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg'
                                                }
                                                alt={p}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="login-footer">
                                <span
                                    onClick={() => {
                                        setMode('signup');
                                        setShowPw(false);
                                    }}
                                >
                                    회원가입
                                </span>
                                <span className="footer-bar">|</span>
                                <span
                                    onClick={() => {
                                        setMode('findPw');
                                        setShowPw(false);
                                    }}
                                >
                                    비밀번호 찾기
                                </span>
                            </div>
                        </>
                    )}

                    {mode === 'signup' && (
                        <>
                            <div className="input-wrapper inner-req">
                                <span className="req-mark">*</span>
                                <input name="id" placeholder="아이디" className="login-input" onChange={onChange} />
                                <button className="inline-check-btn" onClick={checkDuplicateId}>
                                    중복확인
                                </button>
                            </div>
                            {msg.id && (
                                <p className={`status-msg ${msg.id.includes('✅') ? 'success' : 'error'}`}>{msg.id}</p>
                            )}
                            <div className="input-wrapper inner-req">
                                <span className="req-mark">*</span>
                                <input
                                    name="pw"
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="비밀번호 (숫자+문자 6자 이상)"
                                    className="login-input"
                                    onChange={onChange}
                                />
                                <div className="pw-toggle-btn" onClick={() => setShowPw(!showPw)}>
                                    <LockIcon />
                                </div>
                            </div>
                            {msg.pw && (
                                <p className={`status-msg ${msg.pw.includes('✅') ? 'success' : 'error'}`}>{msg.pw}</p>
                            )}
                            <div className="input-wrapper inner-req">
                                <span className="req-mark">*</span>
                                <input
                                    name="confirmPw"
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="비밀번호 확인"
                                    className="login-input"
                                    onChange={onChange}
                                />
                            </div>
                            {msg.confirmPw && (
                                <p className={`status-msg ${msg.confirmPw.includes('✅') ? 'success' : 'error'}`}>
                                    {msg.confirmPw}
                                </p>
                            )}
                            <div className="input-wrapper inner-req">
                                <span className="req-mark">*</span>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="이메일 입력"
                                    className="login-input"
                                    onChange={onChange}
                                />
                            </div>
                            {msg.email && (
                                <p className={`status-msg ${msg.email.includes('✅') ? 'success' : 'error'}`}>
                                    {msg.email}
                                </p>
                            )}
                            <div className="divider-select">
                                <span>선택 사항</span>
                            </div>
                            <input name="nick" placeholder="닉네임" className="login-input" onChange={onChange} />
                            <button className="btn-main-login btn-signup-margin" onClick={handleSignupSubmit}>
                                가입하기
                            </button>
                            <div className="login-footer">
                                <span
                                    onClick={() => {
                                        setMode('login');
                                        setShowPw(false);
                                    }}
                                    className="go-back"
                                >
                                    로그인으로 돌아가기
                                </span>
                            </div>
                        </>
                    )}

                    {mode === 'findPw' && (
                        <>
                            <input name="id" placeholder="아이디" className="login-input" onChange={onChange} />
                            <input
                                name="email"
                                placeholder="가입한 이메일"
                                className="login-input"
                                onChange={onChange}
                            />
                            <button
                                className="btn-main-login btn-signup-margin"
                                onClick={() => {
                                    alert('발송되었습니다.');
                                    setMode('login');
                                }}
                            >
                                임시 비번 발송
                            </button>
                            <div className="login-footer">
                                <span onClick={() => setMode('login')} className="go-back">
                                    로그인으로 돌아가기
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
