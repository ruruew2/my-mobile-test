import React, { useState, useEffect } from 'react';
import './Login.css';

// ✅ 화요일에 백엔드 친구가 주는 서버 주소로 여기만 바꾸세요!
const API_BASE_URL = 'http://54.180.234.226:8080/api/auth';

const LoginPage = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'findPw'>('login');
    const [form, setForm] = useState({ id: '', pw: '', confirmPw: '', email: '', nick: '' });
    const [msg, setMsg] = useState({ id: '', pw: '', confirmPw: '', email: '' });
    
    const [isAutoLogin, setIsAutoLogin] = useState(false);
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // [로그인 유지 확인] 페이지 로드 시 토큰 체크
    useEffect(() => {
        const savedToken = localStorage.getItem('accessToken');
        if (savedToken) {
            onLoginSuccess();
        }
    }, [onLoginSuccess]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (e.target.name === 'id') {
            setMsg({ ...msg, id: '' });
            setIsIdChecked(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'login') handleLogin();
        else if (mode === 'signup') handleSignupSubmit();
        else if (mode === 'findPw') handleFindPw();
    };

    // 1️⃣ [로그인] 백엔드 통신 (JSON 응답 처리)
    const handleLogin = async () => {
        if (!form.id || !form.pw) return alert("아이디와 비밀번호를 입력해주세요.");
        
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.id, // 💡 백엔드 코드 기준: 'id' 입력값을 'email' 필드로 보냄
                    password: form.pw
                })
            });

            const result = await response.json(); // ✅ JSON으로 응답 받음

            if (response.ok) {
                // 백엔드에서 주는 필드명이 'token'인지 'accessToken'인지 확인 필요
                const token = result.token || result.accessToken || result;
                localStorage.setItem('accessToken', typeof token === 'string' ? token : JSON.stringify(token));
                
                onLoginSuccess();
            } else {
                alert(result.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
            }
        } catch (err) {
            alert("서버 연결 실패! 서버가 켜져 있는지 확인해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    // 2️⃣ [아이디 중복 확인]
const checkDuplicateId = async () => {
    if (!form.id) return alert('아이디를 입력해주세요.');

    try {
        // ✅ API_BASE_URL 뒤에 경로가 꼬이지 않도록 직접 조립
        // 친구가 준 서버 주소가 http://54.180.234.226:8080 라면 아래가 맞습니다.
        const targetUrl = `${API_BASE_URL}/check-id?loginId=${form.id}`;
        console.log("요청 주소 확인:", targetUrl); // 개발자 도구 콘솔에서 확인용

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        // 404가 뜨면 주소(경로) 문제, CORS가 뜨면 서버 보안 설정 문제입니다.
        if (!response.ok) {
            console.error("서버 응답 에러 상태:", response.status);
            return alert(`서버 연결 실패 (${response.status}): 주소를 다시 확인하세요.`);
        }

        const result = await response.json();
        if (result === true || result.isAvailable === true) {
            setMsg((prev) => ({ ...prev, id: '✅ 사용 가능한 아이디입니다.' }));
            setIsIdChecked(true);
        } else {
            setMsg((prev) => ({ ...prev, id: '❌ 이미 사용 중인 아이디입니다.' }));
            setIsIdChecked(false);
        }
    } catch (err) {
        console.error("Fetch 에러 상세:", err);
        alert("통신 오류가 발생했습니다. CORS 설정을 확인해 보세요.");
    }
};

    // 3️⃣ [회원가입] 백엔드 통신
    const handleSignupSubmit = async () => {
        if (!isIdChecked) return alert('아이디 중복확인을 해주세요.');
        if (msg.pw.includes('❌') || !form.pw) return alert('비밀번호 규칙을 확인해주세요.');
        if (form.pw !== form.confirmPw) return alert('비밀번호가 일치하지 않습니다.');
        if (!form.email || msg.email.includes('❌')) return alert('올바른 이메일을 입력해주세요.');

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loginId: form.id,
                    email: form.email,
                    password: form.pw,
                    passwordConfirm: form.confirmPw,
                    nickname: form.nick
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("회원가입 성공! 이제 로그인해주세요.");
                setMode('login');
            } else {
                alert(result.message || "가입 중 오류가 발생했습니다.");
            }
        } catch (err) {
            alert("서버 통신 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // 4️⃣ [비밀번호 찾기] 
    const handleFindPw = async () => {
        if (!form.id || !form.email) return alert('정보를 모두 입력해주세요.');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/find-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: form.id, email: form.email })
            });
            if (response.ok) {
                alert('가입하신 이메일로 임시 비밀번호가 발송되었습니다.');
                setMode('login');
            } else {
                const result = await response.json();
                alert(result.message || "정보가 일치하지 않습니다.");
            }
        } catch (err) { alert("서버 통신 오류!"); } 
        finally { setIsLoading(false); }
    };

    // 실시간 유효성 검사 (기존 코드 유지)
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            {showPw ? <path d="M7 11V7a5 5 0 0 1 9.9-1" /> : <path d="M7 11V7a5 5 0 0 1 10 0v4" />}
        </svg>
    );

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="logo">ART-LOG</h1>
                <p className="slogan">
                    {mode === 'login' ? '예술적 순간의 기록' : mode === 'signup' ? '새로운 여정의 시작' : '비밀번호 찾기'}
                </p>

                <form className="input-group" onSubmit={handleSubmit}>
                    {/* --- 로그인 모드 --- */}
                    {mode === 'login' && (
                        <>
                            <input name="id" placeholder="이메일 또는 아이디" className="login-input" onChange={onChange} value={form.id} />
                            <div className="input-wrapper">
                                <input name="pw" type={showPw ? 'text' : 'password'} placeholder="비밀번호" className="login-input" onChange={onChange} value={form.pw} />
                                <button type="button" className="pw-toggle-btn" onClick={() => setShowPw(!showPw)}>
                                    <LockIcon />
                                </button>
                            </div>
                            <div className="login-options">
                                <label className="auto-login-label">
                                    <input type="checkbox" checked={isAutoLogin} onChange={(e) => setIsAutoLogin(e.target.checked)} />
                                    <span>로그인 상태 유지</span>
                                </label>
                            </div>
                            <button type="submit" className="btn-main-login" disabled={isLoading}>
                                {isLoading ? '로그인 중...' : '로그인'}
                            </button>
                            <div className="divider"><span>소셜 로그인</span></div>
                            <div className="social-icon-wrapper">
                                {['Google', 'Kakao', 'Naver'].map((p) => (
                                    <button key={p} type="button" className={`social-icon-item ${p.toLowerCase()}-bg`} onClick={() => onLoginSuccess()}>
                                        {p === 'Naver' ? <span className="naver-text">N</span> : 
                                        <img src={p === 'Google' ? 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png' : 'https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg'} alt={p} />}
                                    </button>
                                ))}
                            </div>
                            <div className="login-footer">
                                <span onClick={() => { setMode('signup'); setShowPw(false); }}>회원가입</span>
                                <span className="footer-bar">|</span>
                                <span onClick={() => { setMode('findPw'); setShowPw(false); }}>비밀번호 찾기</span>
                            </div>
                        </>
                    )}

                    {/* --- 회원가입 모드 --- */}
                    {mode === 'signup' && (
                        <>
                            <div className="input-wrapper inner-req">
                                <span className="req-mark">*</span>
                                <input name="id" placeholder="아이디" className="login-input" onChange={onChange} />
                                <button type="button" className="inline-check-btn" onClick={checkDuplicateId}>중복확인</button>
                            </div>
                            {msg.id && <p className={`status-msg ${msg.id.includes('✅') ? 'success' : 'error'}`}>{msg.id}</p>}
                            
                            <div className="input-wrapper inner-req">
                                <span className="req-mark">*</span>
                                <input name="pw" type={showPw ? 'text' : 'password'} placeholder="비밀번호 (숫자+문자 6자 이상)" className="login-input" onChange={onChange} />
                                <button type="button" className="pw-toggle-btn" onClick={() => setShowPw(!showPw)}><LockIcon /></button>
                            </div>
                            {msg.pw && <p className={`status-msg ${msg.pw.includes('✅') ? 'success' : 'error'}`}>{msg.pw}</p>}
                            
                            <div className="input-wrapper inner-req">
                                <span className="req-mark">*</span>
                                <input name="confirmPw" type={showPw ? 'text' : 'password'} placeholder="비밀번호 확인" className="login-input" onChange={onChange} />
                            </div>
                            {msg.confirmPw && <p className={`status-msg ${msg.confirmPw.includes('✅') ? 'success' : 'error'}`}>{msg.confirmPw}</p>}
                            
                            <div className="input-wrapper inner-req">
                                <span className="req-mark">*</span>
                                <input name="email" type="email" placeholder="이메일 입력" className="login-input" onChange={onChange} />
                            </div>
                            {msg.email && <p className={`status-msg ${msg.email.includes('✅') ? 'success' : 'error'}`}>{msg.email}</p>}
                            
                            <div className="divider-select"><span>선택 사항</span></div>
                            <input name="nick" placeholder="닉네임" className="login-input" onChange={onChange} />
                            
                            <button type="submit" className="btn-main-login btn-signup-margin" disabled={isLoading}>
                                {isLoading ? '처리 중...' : '가입하기'}
                            </button>
                            <div className="login-footer">
                                <span onClick={() => { setMode('login'); setShowPw(false); }} className="go-back">로그인으로 돌아가기</span>
                            </div>
                        </>
                    )}

                    {/* --- 비밀번호 찾기 모드 --- */}
                    {mode === 'findPw' && (
                        <>
                            <input name="id" placeholder="아이디" className="login-input" onChange={onChange} />
                            <input name="email" placeholder="가입한 이메일" className="login-input" onChange={onChange} />
                            <button type="submit" className="btn-main-login btn-signup-margin" disabled={isLoading}>
                                {isLoading ? '발송 중...' : '임시 비번 발송'}
                            </button>
                            <div className="login-footer">
                                <span onClick={() => setMode('login')} className="go-back">로그인으로 돌아가기</span>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LoginPage;