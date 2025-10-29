import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Clock, CheckCircle, Package, Users, BarChart3, Sparkles, Moon, Sun } from 'lucide-react';

const PryanikCalculatorApp = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Загрузка темы из localStorage при монтировании
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  // Сохранение темы в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Состояние калькулятора
  const [recipe, setRecipe] = useState({
    name: 'Имбирный пряник',
    quantity: 10,
    weight: 100
  });

  const [ingredients, setIngredients] = useState([
    { id: 1, name: 'Мука пшеничная в/с', amount: 450, price: 55, unit: 'кг' },
    { id: 2, name: 'Сахар-песок', amount: 150, price: 60, unit: 'кг' },
    { id: 3, name: 'Мёд натуральный', amount: 100, price: 800, unit: 'кг' },
    { id: 4, name: 'Масло сливочное 82%', amount: 100, price: 700, unit: 'кг' },
    { id: 5, name: 'Яйца С1', amount: 2, price: 8, unit: 'шт' },
    { id: 6, name: 'Специи (имбирь, корица)', amount: 15, price: 4000, unit: 'кг' }
  ]);

  const [additionalCosts, setAdditionalCosts] = useState({
    laborHours: 0.7,
    hourlyRate: 800,
    packagingCost: 25,
    overheadPercent: 85,
    markupPercent: 300
  });

  // Переключатель темы
  const ThemeToggle = () => (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`p-2 rounded-lg transition ${
        darkMode
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      aria-label="Toggle dark mode"
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );

  // Расчет себестоимости
  const calculateCosts = () => {
    // Стоимость ингредиентов
    const ingredientsCost = ingredients.reduce((sum, ing) => {
      const costPerUnit = ing.unit === 'кг' ? ing.price / 1000 : ing.price;
      return sum + (ing.amount * costPerUnit);
    }, 0);

    // Трудозатраты
    const laborCost = additionalCosts.laborHours * additionalCosts.hourlyRate;
    const laborTax = laborCost * 0.3; // 30% начисления на ЗП

    // Прямые затраты
    const directCosts = ingredientsCost + laborCost + laborTax;

    // Накладные расходы
    const overheadCosts = directCosts * (additionalCosts.overheadPercent / 100);

    // Полная себестоимость партии
    const totalCostBatch = directCosts + overheadCosts + (additionalCosts.packagingCost * recipe.quantity);

    // Себестоимость единицы
    const costPerUnit = totalCostBatch / recipe.quantity;

    // Цена продажи
    const sellingPrice = costPerUnit * (1 + additionalCosts.markupPercent / 100);

    // Прибыль
    const profitPerUnit = sellingPrice - costPerUnit;
    const totalProfit = profitPerUnit * recipe.quantity;

    return {
      ingredientsCost,
      laborCost: laborCost + laborTax,
      overheadCosts,
      packagingCost: additionalCosts.packagingCost * recipe.quantity,
      totalCostBatch,
      costPerUnit,
      sellingPrice,
      profitPerUnit,
      totalProfit,
      marginPercent: (profitPerUnit / sellingPrice) * 100
    };
  };

  const costs = calculateCosts();

  // Компонент лендинга
  const LandingPage = () => (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-pink-50 via-white to-orange-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 shadow-lg' : 'bg-white shadow-sm'} sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calculator className="text-pink-600" size={32} />
            <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>ПряникПро</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setCurrentPage('payment')}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition"
            >
              Попробовать бесплатно
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-5xl md:text-6xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6 leading-tight`}>
            Перестаньте терять деньги на каждом пряничке
          </h1>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 leading-relaxed`}>
            85% начинающих кондитеров работают себе в убыток из-за неправильного расчета себестоимости.
            ПряникПро рассчитает реальную цену за 2 минуты вместо 30 минут ручных вычислений.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => setCurrentPage('payment')}
              className="bg-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-pink-700 transition shadow-lg"
            >
              Начать считать прибыль
            </button>
            <button
              onClick={() => setCurrentPage('calculator')}
              className={`${darkMode ? 'bg-gray-700 text-pink-400 border-2 border-pink-600 hover:bg-gray-600' : 'bg-white text-pink-600 border-2 border-pink-600 hover:bg-pink-50'} px-8 py-4 rounded-lg text-lg font-semibold transition`}
            >
              Попробовать демо
            </button>
          </div>
          <div className={`flex flex-wrap justify-center gap-8 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              <span>Без установки программ</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              <span>Работает на телефоне</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              <span>Отмена в любой момент</span>
            </div>
          </div>
        </div>
      </section>

      {/* Проблемы и решения */}
      <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-20`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-4xl font-bold text-center mb-16 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Что вы получите через месяц работы с ПряникПро
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className={`${darkMode ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gradient-to-br from-pink-50 to-orange-50'} p-8 rounded-2xl`}>
              <div className="bg-pink-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="text-white" size={32} />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>+27% к прибыли</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Точный учет всех затрат позволяет правильно установить цены. Вы перестанете работать за 150 рублей в час.
              </p>
            </div>

            <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} p-8 rounded-2xl`}>
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>2 минуты на расчет</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Вместо калькулятора и блокнота — просто выбираете рецепт, вводите количество. Готово!
              </p>
            </div>

            <div className={`${darkMode ? 'bg-gradient-to-br from-green-900 to-teal-900' : 'bg-gradient-to-br from-green-50 to-teal-50'} p-8 rounded-2xl`}>
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <BarChart3 className="text-white" size={32} />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Контроль на 100%</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Видите, какой пряник приносит больше денег, где можно сэкономить, когда повышать цены.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Возможности */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className={`text-4xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Всё, что нужно для прибыльной работы
          </h2>
          <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-16 text-lg max-w-2xl mx-auto`}>
            Профессиональные инструменты, которые раньше были доступны только крупным кондитерским
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Calculator,
                title: 'Автоматический расчет себестоимости',
                desc: 'Учитываем ВСЁ: ингредиенты, работу, электричество, упаковку, накладные расходы. Коэффициент 5-7 применяется автоматически.'
              },
              {
                icon: Package,
                title: 'База рецептов и ингредиентов',
                desc: 'Сохраняйте свои рецепты, обновляйте цены поставщиков. Система автоматически пересчитает все калькуляции.'
              },
              {
                icon: Users,
                title: 'Коммерческие предложения для клиентов',
                desc: 'Формируйте профессиональные КП одной кнопкой. Клиент видит только цену, себестоимость остается у вас.'
              },
              {
                icon: Sparkles,
                title: 'Пересчет на любое количество',
                desc: 'Заказали 47 пряников? Система рассчитает 5 замесов, учтет запас на брак, выдаст список закупок.'
              }
            ].map((feature, idx) => (
              <div key={idx} className={`${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white'} p-6 rounded-xl shadow-md hover:shadow-xl transition`}>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <feature.icon className="text-pink-600" size={24} />
                  {feature.title}
                </h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Социальное доказательство */}
      <section className="bg-gradient-to-br from-pink-600 to-orange-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Мастера уже считают с ПряникПро</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-5xl font-bold mb-2">342+</div>
              <div className="text-pink-100">Пряничных мастерских</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">15,847</div>
              <div className="text-pink-100">Расчетов за месяц</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">₽284K</div>
              <div className="text-pink-100">Средняя прибыль в месяц</div>
            </div>
          </div>
        </div>
      </section>

      {/* Тарифы */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className={`text-4xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Один тариф. Все возможности.
          </h2>
          <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-12 text-lg`}>
            Без скрытых платежей и ограничений по количеству расчетов
          </p>

          <div className="max-w-md mx-auto">
            <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-4 border-pink-600' : 'bg-gradient-to-br from-pink-50 to-orange-50 border-4 border-pink-600'} rounded-2xl p-8 shadow-2xl`}>
              <div className="text-center mb-6">
                <div className="inline-block bg-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  ПОПУЛЯРНЫЙ ВЫБОР
                </div>
                <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>ПряникПро</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>1,500₽</span>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>/месяц</span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>50₽ в день — меньше чем один пряник</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Неограниченное количество расчетов',
                  'Сохранение всех рецептов',
                  'База ингредиентов с тремя ценами',
                  'Коммерческие предложения в PDF',
                  'Аналитика по рентабельности',
                  'Работа на телефоне и компьютере',
                  'Техподдержка в WhatsApp',
                  'Обновления и новые функции'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setCurrentPage('payment')}
                className="w-full bg-pink-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-pink-700 transition shadow-lg"
              >
                Начать бесплатный пробный период
              </button>
              <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>
                14 дней бесплатно • Отмена в любой момент
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Гарантия */}
      <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-20`}>
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className={`${darkMode ? 'bg-gradient-to-r from-green-900 to-emerald-900 border-2 border-green-500' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500'} rounded-2xl p-12`}>
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Гарантия возврата денег 30 дней
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-6`}>
              Попробуйте ПряникПро без риска. Если в течение 30 дней вы решите, что сервис вам не подходит —
              мы вернем деньги без лишних вопросов. Просто напишите в поддержку.
            </p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Мы уверены, что вы увидите рост прибыли уже после первых 10 расчетов.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-pink-600 to-orange-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Готовы перестать работать себе в убыток?
          </h2>
          <p className="text-xl mb-8 text-pink-100 max-w-2xl mx-auto">
            Присоединяйтесь к 342 мастерам, которые точно знают свою прибыль с каждого заказа
          </p>
          <button
            onClick={() => setCurrentPage('payment')}
            className="bg-white text-pink-600 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition shadow-2xl"
          >
            Начать считать прибыль сейчас
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-950' : 'bg-gray-900'} text-gray-400 py-12`}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="text-pink-500" size={24} />
            <span className="text-xl font-bold text-white">ПряникПро</span>
          </div>
          <p className="mb-4">Профессиональный калькулятор для кондитеров</p>
          <div className="text-sm">
            <a href="#" className="hover:text-white mx-3">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white mx-3">Условия использования</a>
            <a href="#" className="hover:text-white mx-3">Поддержка</a>
          </div>
          <p className="mt-6 text-xs">© 2025 ПряникПро. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );

  // Компонент страницы оплаты
  const PaymentPage = () => (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-pink-50 to-orange-50'} py-12`}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Хедер */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setCurrentPage('landing')}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} inline-flex items-center gap-2`}
              >
                ← Вернуться на главную
              </button>
              <ThemeToggle />
            </div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Начните считать прибыль</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>14 дней бесплатно, потом 1,500₽ в месяц</p>
          </div>

          {/* Форма регистрации */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 mb-6`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Создайте аккаунт</h2>

            <form className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Имя
                </label>
                <input
                  type="text"
                  placeholder="Анна"
                  className={`w-full px-4 py-3 border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500' : 'bg-white border-gray-200 focus:border-pink-500'} rounded-lg focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="anna@example.com"
                  className={`w-full px-4 py-3 border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500' : 'bg-white border-gray-200 focus:border-pink-500'} rounded-lg focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Телефон (для поддержки)
                </label>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  className={`w-full px-4 py-3 border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500' : 'bg-white border-gray-200 focus:border-pink-500'} rounded-lg focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Пароль
                </label>
                <input
                  type="password"
                  placeholder="Минимум 6 символов"
                  className={`w-full px-4 py-3 border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500' : 'bg-white border-gray-200 focus:border-pink-500'} rounded-lg focus:outline-none`}
                />
              </div>

              <div className={`${darkMode ? 'bg-gray-700 border-2 border-pink-600' : 'bg-pink-50 border-2 border-pink-200'} rounded-lg p-4 my-6`}>
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Ваш план:</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ПряникПро — месячная подписка</span>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>1,500₽</span>
                </div>
                <div className={`flex justify-between items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                  <span>Первые 14 дней</span>
                  <span className="text-green-600 font-semibold">БЕСПЛАТНО</span>
                </div>
                <div className={`border-t ${darkMode ? 'border-gray-600' : 'border-pink-200'} pt-3 flex justify-between items-center`}>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Первое списание 15 ноября 2025</span>
                  <span className="text-xl font-bold text-pink-600">0₽</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSubscribed(true);
                  setCurrentPage('calculator');
                }}
                className="w-full bg-pink-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-pink-700 transition"
              >
                Начать бесплатный период
              </button>

              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} text-center`}>
                Нажимая кнопку, вы соглашаетесь с{' '}
                <a href="#" className="text-pink-600 hover:underline">условиями использования</a>
                {' '}и{' '}
                <a href="#" className="text-pink-600 hover:underline">политикой конфиденциальности</a>
              </p>
            </form>
          </div>

          {/* Преимущества */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-md p-6`}>
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Что входит в подписку:</h3>
            <ul className="space-y-3">
              {[
                'Неограниченное количество расчетов себестоимости',
                'Сохранение базы рецептов и ингредиентов',
                'Коммерческие предложения в один клик',
                'Техническая поддержка в WhatsApp',
                'Все обновления бесплатно'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Компонент калькулятора
  const CalculatorPage = () => {
    const addIngredient = () => {
      const newId = Math.max(...ingredients.map(i => i.id), 0) + 1;
      setIngredients([...ingredients, {
        id: newId,
        name: '',
        amount: 0,
        price: 0,
        unit: 'кг'
      }]);
    };

    const removeIngredient = (id) => {
      setIngredients(ingredients.filter(ing => ing.id !== id));
    };

    const updateIngredient = (id, field, value) => {
      setIngredients(ingredients.map(ing =>
        ing.id === id ? { ...ing, [field]: value } : ing
      ));
    };

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-pink-50 to-orange-50'} py-8`}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 mb-6`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Calculator className="text-pink-600" size={32} />
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Калькулятор себестоимости</h1>
                  {!isSubscribed && (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Демо-режим</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <ThemeToggle />
                <button
                  onClick={() => setCurrentPage('landing')}
                  className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} px-4 py-2`}
                >
                  На главную
                </button>
                {!isSubscribed && (
                  <button
                    onClick={() => setCurrentPage('payment')}
                    className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition"
                  >
                    Оформить подписку
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Левая колонка - ввод данных */}
            <div className="lg:col-span-2 space-y-6">
              {/* Параметры заказа */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Параметры заказа</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Название рецепта
                    </label>
                    <input
                      type="text"
                      value={recipe.name}
                      onChange={(e) => setRecipe({...recipe, name: e.target.value})}
                      className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-pink-500' : 'border-gray-300 focus:border-pink-500'} rounded-lg focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Количество, шт
                    </label>
                    <input
                      type="number"
                      value={recipe.quantity}
                      onChange={(e) => setRecipe({...recipe, quantity: parseInt(e.target.value) || 0})}
                      className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-pink-500' : 'border-gray-300 focus:border-pink-500'} rounded-lg focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Вес 1 шт, г
                    </label>
                    <input
                      type="number"
                      value={recipe.weight}
                      onChange={(e) => setRecipe({...recipe, weight: parseInt(e.target.value) || 0})}
                      className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-pink-500' : 'border-gray-300 focus:border-pink-500'} rounded-lg focus:outline-none`}
                    />
                  </div>
                </div>
                <div className={`mt-4 p-3 ${darkMode ? 'bg-gray-700' : 'bg-pink-50'} rounded-lg`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-semibold">Общий вес партии:</span> {recipe.quantity * recipe.weight} г
                    ({(recipe.quantity * recipe.weight / 1000).toFixed(2)} кг)
                  </p>
                </div>
              </div>

              {/* Ингредиенты */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ингредиенты</h2>
                  <button
                    onClick={addIngredient}
                    className="text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1"
                  >
                    + Добавить
                  </button>
                </div>

                <div className="space-y-3">
                  {ingredients.map((ing) => (
                    <div key={ing.id} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Название"
                        value={ing.name}
                        onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                        className={`col-span-4 px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500' : 'border-gray-300 focus:border-pink-500'} rounded-lg text-sm focus:outline-none`}
                      />
                      <input
                        type="number"
                        placeholder="Кол-во"
                        value={ing.amount}
                        onChange={(e) => updateIngredient(ing.id, 'amount', parseFloat(e.target.value) || 0)}
                        className={`col-span-2 px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500' : 'border-gray-300 focus:border-pink-500'} rounded-lg text-sm focus:outline-none`}
                      />
                      <select
                        value={ing.unit}
                        onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                        className={`col-span-2 px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-pink-500' : 'border-gray-300 focus:border-pink-500'} rounded-lg text-sm focus:outline-none`}
                      >
                        <option value="кг">кг</option>
                        <option value="шт">шт</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Цена"
                        value={ing.price}
                        onChange={(e) => updateIngredient(ing.id, 'price', parseFloat(e.target.value) || 0)}
                        className={`col-span-2 px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500' : 'border-gray-300 focus:border-pink-500'} rounded-lg text-sm focus:outline-none`}
                      />
                      <div className={`col-span-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>
                        {((ing.unit === 'кг' ? ing.price / 1000 : ing.price) * ing.amount).toFixed(2)}₽
                      </div>
                      <button
                        onClick={() => removeIngredient(ing.id)}
                        className="col-span-1 text-red-500 hover:text-red-700 text-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>Итого ингредиенты:</span>
                    <span className="text-pink-600">{costs.ingredientsCost.toFixed(2)}₽</span>
                  </div>
                </div>
              </div>

              {/* Дополнительные расходы */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Дополнительные расходы</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Работа кондитера, часы
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={additionalCosts.laborHours}
                      onChange={(e) => setAdditionalCosts({...additionalCosts, laborHours: parseFloat(e.target.value) || 0})}
                      className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-pink-500' : 'border-gray-300 focus:border-pink-500'} rounded-lg focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Стоимость часа, ₽
                    </label>
                    <input
                      type="number"
                      value={additionalCosts.hourlyRate}
                      onChange={(e) => setAdditionalCosts({...additionalCosts, hourlyRate: parseFloat(e.target.value) || 0})}
                      className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-pink-500' : 'border-gray-300 focus:border-pink-500'} rounded-lg focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Упаковка на 1 шт, ₽
                    </label>
                    <input
                      type="number"
                      value={additionalCosts.packagingCost}
                      onChange={(e) => setAdditionalCosts({...additionalCosts, packagingCost: parseFloat(e.target.value) || 0})}
                      className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-pink-500' : 'border-gray-300 focus:border-pink-500'} rounded-lg focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Накладные расходы, %
                    </label>
                    <input
                      type="number"
                      value={additionalCosts.overheadPercent}
                      onChange={(e) => setAdditionalCosts({...additionalCosts, overheadPercent: parseFloat(e.target.value) || 0})}
                      className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-pink-500' : 'border-gray-300 focus:border-pink-500'} rounded-lg focus:outline-none`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка - результаты */}
            <div className="space-y-6">
              {/* Итоговая себестоимость */}
              <div className="bg-gradient-to-br from-pink-600 to-orange-500 text-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-6">Результаты расчета</h2>

                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                    <div className="text-sm text-pink-100 mb-1">Себестоимость 1 шт</div>
                    <div className="text-3xl font-bold">{costs.costPerUnit.toFixed(2)}₽</div>
                  </div>

                  <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                    <div className="text-sm text-pink-100 mb-1">Рекомендуемая цена</div>
                    <div className="text-3xl font-bold">{costs.sellingPrice.toFixed(2)}₽</div>
                    <div className="text-xs text-pink-100 mt-1">
                      Наценка {additionalCosts.markupPercent}%
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-pink-100 mb-2">
                      Наценка, %
                    </label>
                    <input
                      type="number"
                      value={additionalCosts.markupPercent}
                      onChange={(e) => setAdditionalCosts({...additionalCosts, markupPercent: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border-2 border-white/30 bg-white/20 text-white rounded-lg focus:border-white focus:outline-none placeholder-pink-200"
                    />
                  </div>

                  <div className="border-t border-white/30 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-pink-100">Прибыль с 1 шт:</span>
                      <span className="font-semibold">{costs.profitPerUnit.toFixed(2)}₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-100">Общая прибыль:</span>
                      <span className="font-semibold text-lg">{costs.totalProfit.toFixed(2)}₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-100">Маржинальность:</span>
                      <span className="font-semibold">{costs.marginPercent.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-white text-pink-600 py-3 rounded-lg font-semibold mt-6 hover:bg-pink-50 transition">
                  Сформировать КП для клиента
                </button>
              </div>

              {/* Детализация затрат */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6`}>
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Структура себестоимости</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ингредиенты</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{costs.ingredientsCost.toFixed(2)}₽</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Работа + налоги</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{costs.laborCost.toFixed(2)}₽</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Упаковка</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{costs.packagingCost.toFixed(2)}₽</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Накладные расходы</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{costs.overheadCosts.toFixed(2)}₽</span>
                  </div>
                  <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-3 flex justify-between items-center`}>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>ИТОГО партия:</span>
                    <span className="font-bold text-xl text-pink-600">{costs.totalCostBatch.toFixed(2)}₽</span>
                  </div>
                </div>
              </div>

              {!isSubscribed && (
                <div className={`${darkMode ? 'bg-gradient-to-br from-orange-900 to-pink-900 border-2 border-pink-500' : 'bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-pink-300'} rounded-xl p-6`}>
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Демо-режим</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                    Вы используете ограниченную версию. Оформите подписку для доступа к сохранению рецептов,
                    базе ингредиентов и формированию КП.
                  </p>
                  <button
                    onClick={() => setCurrentPage('payment')}
                    className="w-full bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700 transition"
                  >
                    Оформить подписку 1,500₽/мес
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Рендер текущей страницы
  return (
    <div>
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'payment' && <PaymentPage />}
      {currentPage === 'calculator' && <CalculatorPage />}
    </div>
  );
};

export default PryanikCalculatorApp;
