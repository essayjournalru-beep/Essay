import { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { getUserProfile, saveUserProfile } from '../services/firebaseService';
import { UserProfile, UserRole } from '../types';
import { BrandWordmark } from './BrandAssets';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userProfile: UserProfile) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lowerEmail = email.toLowerCase().trim();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    if (!emailRegex.test(lowerEmail) || lowerEmail.includes('xn--')) {
      setError('Введите корректный адрес электронной почты.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов.');
      return;
    }

    setLoading(true);

    try {
      const isOwnerEmail = lowerEmail === 'owner@essay.ru' || lowerEmail === 'elshan@ozat.kz';
      const isGodzhaev = lowerEmail === 'godzhaev23@gmail.com';

      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, lowerEmail, password);
        await updateProfile(cred.user, { displayName: name.trim() || lowerEmail.split('@')[0] });

        const existingProfile = await getUserProfile(cred.user.uid);
        let roleToAssign: UserRole = 'reader';
        if (existingProfile && existingProfile.role) {
          roleToAssign = existingProfile.role;
        } else if (isOwnerEmail) {
          roleToAssign = 'owner';
        } else if (isGodzhaev) {
          roleToAssign = 'admin';
        }

        const newProfile: UserProfile = {
          id: cred.user.uid,
          email: lowerEmail,
          name: name.trim() || lowerEmail.split('@')[0],
          role: roleToAssign,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(lowerEmail)}`,
          createdAt: new Date().toISOString().split('T')[0],
        };

        await saveUserProfile(newProfile);
        onLoginSuccess(newProfile);
        onClose();
      } else {
        const cred = await signInWithEmailAndPassword(auth, lowerEmail, password);
        let profile = await getUserProfile(cred.user.uid);

        if (profile) {
          if (isOwnerEmail && profile.role !== 'owner') {
            profile.role = 'owner';
            await saveUserProfile(profile);
          } else if (isGodzhaev && profile.role === 'reader') {
            profile.role = 'admin';
            await saveUserProfile(profile);
          }
          onLoginSuccess(profile);
          onClose();
        } else {
          const fallbackProfile: UserProfile = {
            id: cred.user.uid,
            email: lowerEmail,
            name: cred.user.displayName || lowerEmail.split('@')[0],
            role: isOwnerEmail ? 'owner' : isGodzhaev ? 'admin' : 'reader',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(lowerEmail)}`,
            createdAt: new Date().toISOString().split('T')[0],
          };
          await saveUserProfile(fallbackProfile);
          onLoginSuccess(fallbackProfile);
          onClose();
        }
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Произошла ошибка при аутентификации.';
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errMsg = 'Неверный адрес почты или пароль. Пожалуйста, проверьте данные.';
          break;
        case 'auth/email-already-in-use':
          errMsg = 'Пользователь с такой почтой уже зарегистрирован. Переключитесь на «Вход».';
          break;
        case 'auth/too-many-requests':
          errMsg = 'Слишком много неудачных попыток. Пожалуйста, подождите несколько минут.';
          break;
        case 'auth/network-request-failed':
          errMsg = 'Ошибка соединения с сервером. Проверьте подключение к интернету.';
          break;
        default:
          if (err.message) errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;
      const userEmail = (user.email || '').toLowerCase();
      const isOwnerEmail = userEmail === 'owner@essay.ru' || userEmail === 'elshan@ozat.kz';
      const isGodzhaev = userEmail === 'godzhaev23@gmail.com';

      let profile = await getUserProfile(user.uid);
      if (profile) {
        if (isOwnerEmail && profile.role !== 'owner') {
          profile.role = 'owner';
          await saveUserProfile(profile);
        } else if (isGodzhaev && profile.role === 'reader') {
          profile.role = 'admin';
          await saveUserProfile(profile);
        }
        onLoginSuccess(profile);
        onClose();
      } else {
        const newProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'Пользователь',
          role: isOwnerEmail ? 'owner' : isGodzhaev ? 'admin' : 'reader',
          avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || '')}`,
          createdAt: new Date().toISOString().split('T')[0],
        };
        await saveUserProfile(newProfile);
        onLoginSuccess(newProfile);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Ошибка входа через Google.';
      if (err.code === 'auth/popup-closed-by-user') {
        errMsg = 'Всплывающее окно входа было закрыто.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FAF7F2] dark:bg-[#241E1A] rounded-3xl shadow-2xl border border-[#EBDBC4] dark:border-[#3A322B] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2D3BE] dark:border-[#3D352E] bg-[#F4EFE6] dark:bg-[#1A1613]">
          <div className="flex flex-col gap-0.5">
            <BrandWordmark className="h-7 text-[#1F1914] dark:text-[#FAF7F2]" />
            <p className="text-[11px] text-[#4A4036] dark:text-[#D1C7BD] font-medium">
              {isSignUp ? 'Регистрация автора' : 'Вход в аккаунт'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#4A4036] hover:bg-[#E2D3BE]/50 dark:hover:bg-[#2A231D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-[#6B625B] dark:text-[#9E9388] mb-1.5">
                  Ваше имя или псевдоним
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#C85D36] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например, Лев Толстой"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#EBDBC4] dark:border-[#3A322B] text-[#2B241E] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#6B625B] dark:text-[#9E9388] mb-1.5">
                Электронная почта
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#C85D36] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@essay.ru"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#EBDBC4] dark:border-[#3A322B] text-[#2B241E] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B625B] dark:text-[#9E9388] mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#C85D36] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#EBDBC4] dark:border-[#3A322B] text-[#2B241E] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#2B241E] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Обработка...' : isSignUp ? 'Зарегистрироваться' : 'Войти в кабинет'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EBDBC4] dark:border-[#3A322B]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#FAF7F2] dark:bg-[#241E1A] text-[#8C827A]">или</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#F4EFE6] dark:bg-[#1A1613] border border-[#EBDBC4] dark:border-[#3A322B] text-xs font-semibold text-[#2B241E] dark:text-[#FAF7F2] hover:bg-[#EBDBC4]/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Войти через Google</span>
          </button>

          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-xs text-[#C85D36] hover:underline cursor-pointer"
            >
              {isSignUp ? 'Уже есть профиль? Войти' : 'Нет аккаунта? Зарегистрироваться как автор'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
