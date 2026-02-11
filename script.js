Perfeito! Aqui está o arquivo script.js:

// State management
let allData = [];
let currentUser = null;
let currentView = 'splash';
let config = {};

const defaultConfig = {
  system_title: 'ACCESS CONTROL BCB CF',
  primary_color: '#1e3a5f',
  secondary_color: '#f8fafc',
  text_color: '#1e293b',
  accent_color: '#059669',
  danger_color: '#dc2626'
};

// Initialize Element SDK
window.elementSdk.init({
  defaultConfig,
  onConfigChange: async (newConfig) => {
    config = { ...defaultConfig, ...newConfig };
    renderCurrentView();
  },
  mapToCapabilities: (cfg) => ({
    recolorables: [
      {
        get: () => cfg.primary_color || defaultConfig.primary_color,
        set: (v) => window.elementSdk.setConfig({ primary_color: v })
      },
      {
        get: () => cfg.secondary_color || defaultConfig.secondary_color,
        set: (v) => window.elementSdk.setConfig({ secondary_color: v })
      },
      {
        get: () => cfg.text_color || defaultConfig.text_color,
        set: (v) => window.elementSdk.setConfig({ text_color: v })
      },
      {
        get: () => cfg.accent_color || defaultConfig.accent_color,
        set: (v) => window.elementSdk.setConfig({ accent_color: v })
      },
      {
        get: () => cfg.danger_color || defaultConfig.danger_color,
        set: (v) => window.elementSdk.setConfig({ danger_color: v })
      }
    ],
    borderables: [],
    fontEditable: undefined,
    fontSizeable: undefined
  }),
  mapToEditPanelValues: (cfg) => new Map([
    ['system_title', cfg.system_title || defaultConfig.system_title]
  ])
});

config = { ...defaultConfig, ...window.elementSdk.config };

// Data SDK handler
const dataHandler = {
  onDataChanged: (data) => {
    allData = data;
    cleanOldRecords();
    renderCurrentView();
  }
};

// Initialize Data SDK
(async () => {
  const result = await window.dataSdk.init(dataHandler);
  if (result.isOk) {
    initializeDefaultAdmin();
  }
})();

// Initialize default admin if not exists
async function initializeDefaultAdmin() {
  const users = allData.filter(d => d.type === 'user');
  const adminExists = users.some(u => u.role === 'admin');
  
  if (!adminExists && allData.length < 999) {
    await window.dataSdk.create({
      type: 'user',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      mustChangePassword: false,
      createdAt: new Date().toISOString()
    });
  }
  
  // Show splash screen
  showSplash();
}

// Clean records older than 6 months (LGPD compliance)
async function cleanOldRecords() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const oldRecords = allData.filter(d => 
    d.type === 'visitor' && 
    new Date(d.createdAt) < sixMonthsAgo
  );
  
  for (const record of oldRecords) {
    await window.dataSdk.delete(record);
  }
}

// Show splash screen
function showSplash() {
  currentView = 'splash';
  const app = document.getElementById('app');
  const title = config.system_title || defaultConfig.system_title;
  
  app.innerHTML = `
    <div class="h-full flex items-center justify-center p-4">
      <div class="text-center fade-in">
        <div class="mb-8">
          <svg class="w-24 h-24 mx-auto mb-6" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="${config.primary_color}" stroke-width="3" fill="${config.secondary_color}"/>
            <path d="M50 25 L50 50 L70 60" stroke="${config.primary_color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="50" cy="50" r="6" fill="${config.accent_color}"/>
            <path d="M30 75 L50 65 L70 75" stroke="${config.primary_color}" stroke-width="3" stroke-linecap="round"/>
            <rect x="35" y="30" width="30" height="20" rx="3" stroke="${config.primary_color}" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <h1 class="text-4xl font-bold mb-4" style="color: ${config.primary_color}">${title}</h1>
        <p class="text-lg mb-8" style="color: ${config.text_color}">Sistema de Controle de Acesso</p>
        <div class="bg-white rounded-xl p-6 card-shadow max-w-md mx-auto mb-8">
          <p class="text-sm" style="color: ${config.text_color}">
            <span class="font-semibold">Criado por Thiago Pereira</span>
          </p>
        </div>
        <button onclick="showLogin()" class="btn-primary text-white px-8 py-3 rounded-lg font-semibold text-lg">
          Entrar no Sistema
        </button>
      </div>
    </div>
  `;
}

// Show login screen
function showLogin() {
  currentView = 'login';
  const app = document.getElementById('app');
  const title = config.system_title || defaultConfig.system_title;
  
  app.innerHTML = `
    <div class="h-full flex items-center justify-center p-4">
      <div class="w-full max-w-md slide-in">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold" style="color: ${config.primary_color}">${title}</h1>
          <p class="mt-2" style="color: ${config.text_color}">Faça login para continuar</p>
        </div>
        <div class="bg-white rounded-2xl p-8 card-shadow">
          <form id="loginForm" onsubmit="handleLogin(event)">
            <div class="mb-6">
              <label for="username" class="block text-sm font-medium mb-2" style="color: ${config.text_color}">Usuário</label>
              <input type="text" id="username" required
                class="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Digite seu usuário">
            </div>
            <div class="mb-6">
              <label for="password" class="block text-sm font-medium mb-2" style="color: ${config.text_color}">Senha</label>
              <input type="password" id="password" required
                class="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Digite sua senha">
            </div>
            <div id="loginError" class="hidden mb-4 p-3 rounded-lg text-sm text-white" style="background: ${config.danger_color}"></div>
            <button type="submit" class="w-full btn-primary text-white py-3 rounded-lg font-semibold text-lg">
              Entrar
            </button>
          </form>
        </div>
        <p class="text-center mt-6 text-sm" style="color: ${config.text_color}">
          Admin padrão: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </div>
    </div>
  `;
}

// Handle login
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');
  
  const users = allData.filter(d => d.type === 'user');
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    currentUser = user;
    if (user.mustChangePassword) {
      showChangePassword(true);
    } else {
      showDashboard();
    }
  } else {
    errorDiv.textContent = 'Usuário ou senha incorretos';
    errorDiv.classList.remove('hidden');
  }
}

// Show change password screen
function showChangePassword(forced = false) {
  currentView = 'changePassword';
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="h-full flex items-center justify-center p-4">
      <div class="w-full max-w-md slide-in">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold" style="color: ${config.primary_color}">Trocar Senha</h1>
          <p class="mt-2" style="color: ${config.text_color}">
            ${forced ? 'Por favor, defina uma nova senha para continuar' : 'Digite sua nova senha'}
          </p>
        </div>
        <div class="bg-white rounded-2xl p-8 card-shadow">
          <form id="changePasswordForm" onsubmit="handleChangePassword(event, ${forced})">
            <div class="mb-6">
              <label for="newPassword" class="block text-sm font-medium mb-2" style="color: ${config.text_color}">Nova Senha</label>
              <input type="password" id="newPassword" required minlength="6"
                class="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Mínimo 6 caracteres">
            </div>
            <div class="mb-6">
              <label for="confirmPassword" class="block text-sm font-medium mb-2" style="color: ${config.text_color}">Confirmar Senha</label>
              <input type="password" id="confirmPassword" required
                class="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Repita a nova senha">
            </div>
            <div id="changeError" class="hidden mb-4 p-3 rounded-lg text-sm text-white" style="background: ${config.danger_color}"></div>
            <button type="submit" class="w-full btn-primary text-white py-3 rounded-lg font-semibold text-lg">
              Salvar Nova Senha
            </button>
            ${!forced ? `<button type="button" onclick="showDashboard()" class="w-full mt-3 py-3 rounded-lg font-semibold border-2" style="border-color: ${config.primary_color}; color: ${config.primary_color}">Cancelar</button>` : ''}
          </form>
        </div>
      </div>
    </div>
  `;
}

// Handle change password
async function handleChangePassword(e, forced) {
  e.preventDefault();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('changeError');
  
  if (newPassword !== confirmPassword) {
    errorDiv.textContent = 'As senhas não coincidem';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  const updatedUser = { ...currentUser, password: newPassword, mustChangePassword: false };
  const result = await window.dataSdk.update(updatedUser);
  
  if (result.isOk) {
    currentUser = updatedUser;
    showDashboard();
  } else {
    errorDiv.textContent = 'Erro ao atualizar senha';
    errorDiv.classList.remove('hidden');
  }
}

// Show dashboard
function showDashboard() {
  currentView = 'dashboard';
  renderCurrentView();
}

function renderCurrentView() {
  if (currentView === 'splash') {
    showSplash();
  } else if (currentView === 'login') {
    showLogin();
  } else if (currentView === 'changePassword') {
    showChangePassword();
  } else if (currentView === 'dashboard') {
    renderDashboard();
  } else if (currentView === 'users') {
    renderUsers();
  } else if (currentView === 'reports') {
    renderReports();
  }
}

// Render dashboard
function renderDashboard() {
  const app = document.getElementById('app');
  const title = config.system_title || defaultConfig.system_title;
  const visitors = allData.filter(d => d.type === 'visitor');
  const activeVisitors = visitors.filter(v => v.status === 'inside');
  const isAdmin = currentUser?.role === 'admin';
  
  app.innerHTML = `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <header class="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg class="w-10 h-10" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="${config.primary_color}" stroke-width="3" fill="${config.secondary_color}"/>
            <path d="M50 25 L50 50 L70 60" stroke="${config.primary_color}" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <div>
            <h1 class="text-lg font-bold" style="color: ${config.primary_color}">${title}</h1>
            <p class="text-xs" style="color: ${config.text_color}">Olá, ${currentUser?.username} (${isAdmin ? 'Admin' : 'Usuário'})</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${isAdmin ? `
            <button onclick="showUsers()" class="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100" style="color: ${config.primary_color}">
              👥 Usuários
            </button>
            <button onclick="showReports()" class="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100" style="color: ${config.primary_color}">
              📊 Relatórios
            </button>
          ` : ''}
          <button onclick="showChangePassword(false)" class="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100" style="color: ${config.primary_color}">
            🔑 Senha
          </button>
          <button onclick="logout()" class="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-50" style="color: ${config.danger_color}">
            Sair
          </button>
        </div>
      </header>
      
      <!-- Stats -->
      <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl p-4 card-shadow">
          <p class="text-sm font-medium" style="color: ${config.text_color}">No Prédio</p>
          <p class="text-3xl font-bold" style="color: ${config.accent_color}">${activeVisitors.length}</p>
        </div>
        <div class="bg-white rounded-xl p-4 card-shadow">
          <p class="text-sm font-medium" style="color: ${config.text_color}">Total Hoje</p>
          <p class="text-3xl font-bold" style="color: ${config.primary_color}">${visitors.filter(v => isToday(v.createdAt)).length}</p>
        </div>
        <div class="bg-white rounded-xl p-4 card-shadow">
          <p class="text-sm font-medium" style="color: ${config.text_color}">Total Geral</p>
          <p class="text-3xl font-bold" style="color: ${config.text_color}">${visitors.length}</p>
        </div>
      </div>
      
      <!-- New Visitor Form -->
      <div class="px-4 pb-4">
        <div class="bg-white rounded-xl p-4 card-shadow">
          <h2 class="text-lg font-bold mb-4" style="color: ${config.primary_color}">Registrar Entrada</h2>
          <form id="visitorForm" onsubmit="handleNewVisitor(event)" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label for="visitorName" class="block text-xs font-medium mb-1" style="color: ${config.text_color}">Nome</label>
                <input type="text" id="visitorName" required class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm">
              </div>
              <div>
                <label for="visitorDoc" class="block text-xs font-medium mb-1" style="color: ${config.text_color}">Documento</label>
                <input type="text" id="visitorDoc" required class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm">
              </div>
              <div>
                <label for="visitorType" class="block text-xs font-medium mb-1" style="color: ${config.text_color}">Tipo</label>
                <select id="visitorType" required onchange="updateVisitorFields()" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm">
                  <option value="">Selecione...</option>
                  <option value="visitante">Visitante</option>
                  <option value="prestador">Prestador de Serviços</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div id="companyField" class="hidden">
                <label for="visitorCompany" class="block text-xs font-medium mb-1" style="color: ${config.text_color}">Empresa</label>
                <input type="text" id="visitorCompany" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm">
              </div>
              
              <div id="reasonField" class="hidden">
                <label for="visitorReason" class="block text-xs font-medium mb-1" style="color: ${config.text_color}">Motivo da Visita</label>
                <input type="text" id="visitorReason" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm">
              </div>
              
              <div>
                <label for="visitorMeeting" class="block text-xs font-medium mb-1" style="color: ${config.text_color}">Reunião Com</label>
                <input type="text" id="visitorMeeting" required class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm">
              </div>
              
              <div class="flex items-end">
                <button type="submit" class="w-full btn-primary text-white py-2 rounded-lg font-medium text-sm">
                  + Registrar Entrada
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Active Visitors -->
      <div class="flex-1 px-4 pb-4 overflow-hidden">
        <div class="bg-white rounded-xl card-shadow h-full flex flex-col">
          <div class="p-4 border-b border-slate-100">
            <h2 class="text-lg font-bold" style="color: ${config.primary_color}">Pessoas no Prédio (${activeVisitors.length})</h2>
          </div>
          <div class="flex-1 overflow-auto p-4">
            ${activeVisitors.length === 0 ? `
              <div class="text-center py-12">
                <p class="text-lg" style="color: ${config.text_color}">Nenhuma pessoa no prédio</p>
              </div>
            ` : `
              <table class="w-full">
                <thead>
                  <tr class="text-left text-xs font-medium uppercase" style="color: ${config.text_color}">
                    <th class="pb-3 pr-4">Nome</th>
                    <th class="pb-3 pr-4">Documento</th>
                    <th class="pb-3 pr-4">Tipo</th>
                    <th class="pb-3 pr-4">Empresa/Motivo</th>
                    <th class="pb-3 pr-4">Reunião Com</th>
                    <th class="pb-3 pr-4">Entrada</th>
                    <th class="pb-3 pr-4">Operador</th>
                    <th class="pb-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeVisitors.map(v => `
                    <tr class="table-row border-b border-slate-50">
                      <td class="py-3 pr-4 font-medium" style="color: ${config.text_color}">${v.name}</td>
                      <td class="py-3 pr-4 text-sm" style="color: ${config.text_color}">${v.document}</td>
                      <td class="py-3 pr-4 text-sm">
                        <span class="px-2 py-1 rounded text-xs font-medium ${v.visitorType === 'prestador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                          ${v.visitorType === 'prestador' ? 'Prestador' : 'Visitante'}
                        </span>
                      </td>
                      <td class="py-3 pr-4 text-sm" style="color: ${config.text_color}">${v.visitorType === 'prestador' ? v.company : v.visitReason}</td>
                      <td class="py-3 pr-4 text-sm" style="color: ${config.text_color}">${v.meetingWith || '-'}</td>
                      <td class="py-3 pr-4 text-sm" style="color: ${config.text_color}">${formatTime(v.entryTime)}</td>
                      <td class="py-3 pr-4 text-sm" style="color: ${config.text_color}">${v.entryOperator}</td>
                      <td class="py-3">
                        <button onclick="registerExit('${v.__backendId}')" class="px-3 py-1 rounded text-sm font-medium text-white" style="background: ${config.accent_color}">
                          Registrar Saída
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Handle new visitor
async function handleNewVisitor(e) {
  e.preventDefault();
  
  if (allData.length >= 999) {
    showToast('Limite de registros atingido (999). Por favor, aguarde a limpeza automática.', 'error');
    return;
  }
  
  const name = document.getElementById('visitorName').value;
  const document_id = document.getElementById('visitorDoc').value;
  const type = document.getElementById('visitorType').value;
  const meeting = document.getElementById('visitorMeeting').value;
  
  let company = '';
  let reason = '';
  
  if (type === 'visitante') {
    reason = document.getElementById('visitorReason').value;
    if (!reason) {
      showToast('Por favor, preencha o Motivo da Visita', 'error');
      return;
    }
  } else if (type === 'prestador') {
    company = document.getElementById('visitorCompany').value;
    if (!company) {
      showToast('Por favor, preencha a Empresa', 'error');
      return;
    }
  }
  
  const result = await window.dataSdk.create({
    type: 'visitor',
    visitorType: type,
    name: name,
    document: document_id,
    company: company,
    visitReason: reason,
    meetingWith: meeting,
    entryTime: new Date().toISOString(),
    entryOperator: currentUser.username,
    exitTime: '',
    exitOperator: '',
    status: 'inside',
    createdAt: new Date().toISOString()
  });
  
  if (result.isOk) {
    document.getElementById('visitorForm').reset();
    document.getElementById('companyField').classList.add('hidden');
    document.getElementById('reasonField').classList.add('hidden');
    showToast('Entrada registrada com sucesso!', 'success');
  } else {
    showToast('Erro ao registrar entrada', 'error');
  }
}

// Update visitor fields based on type selection
function updateVisitorFields() {
  const type = document.getElementById('visitorType').value;
  const companyField = document.getElementById('companyField');
  const reasonField = document.getElementById('reasonField');
  const companyInput = document.getElementById('visitorCompany');
  const reasonInput = document.getElementById('visitorReason');
  
  if (type === 'prestador') {
    companyField.classList.remove('hidden');
    reasonField.classList.add('hidden');
    companyInput.required = true;
    reasonInput.required = false;
  } else if (type === 'visitante') {
    companyField.classList.add('hidden');
    reasonField.classList.remove('hidden');
    companyInput.required = false;
    reasonInput.required = true;
  } else {
    companyField.classList.add('hidden');
    reasonField.classList.add('hidden');
    companyInput.required = false;
    reasonInput.required = false;
  }
}

// Register exit
async function registerExit(backendId) {
  const visitor = allData.find(d => d.__backendId === backendId);
  if (!visitor) return;
  
  const updated = {
    ...visitor,
    exitTime: new Date().toISOString(),
    exitOperator: currentUser.username,
    status: 'exited'
  };
  
  const result = await window.dataSdk.update(updated);
  if (result.isOk) {
    showToast('Saída registrada com sucesso!', 'success');
  }
}

// Show users management
function showUsers() {
  currentView = 'users';
  renderUsers();
}

function renderUsers() {
  const app = document.getElementById('app');
  const title = config.system_title || defaultConfig.system_title;
  const users = allData.filter(d => d.type === 'user');
  
  app.innerHTML = `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <header class="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button onclick="showDashboard()" class="p-2 rounded-lg hover:bg-slate-100">
            <svg class="w-6 h-6" fill="none" stroke="${config.primary_color}" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 class="text-lg font-bold" style="color: ${config.primary_color}">Gestão de Usuários</h1>
        </div>
      </header>
      
      <!-- New User Form -->
      <div class="p-4">
        <div class="bg-white rounded-xl p-4 card-shadow">
          <h2 class="text-lg font-bold mb-4" style="color: ${config.primary_color}">Criar Novo Usuário</h2>
          <form id="userForm" onsubmit="handleNewUser(event)" class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label for="newUsername" class="block text-xs font-medium mb-1" style="color: ${config.text_color}">Usuário</label>
              <input type="text" id="newUsername" required class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm">
            </div>
            <div>
              <label for="newUserPassword" class="block text-xs font-medium mb-1" style="color: ${config.text_color}">Senha Inicial</label>
              <input type="password" id="newUserPassword" required class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm">
            </div>
            <div>
              <label for="newUserRole" class="block text-xs font-medium mb-1" style="color: ${config.text_color}">Perfil</label>
              <select id="newUserRole" required class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm">
                <option value="user">Usuário</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="flex items-end">
              <button type="submit" class="w-full btn-primary text-white py-2 rounded-lg font-medium text-sm">
                + Criar Usuário
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Users List -->
      <div class="flex-1 px-4 pb-4 overflow-hidden">
        <div class="bg-white rounded-xl card-shadow h-full flex flex-col">
          <div class="p-4 border-b border-slate-100">
            <h2 class="text-lg font-bold" style="color: ${config.primary_color}">Usuários Cadastrados (${users.length})</h2>
          </div>
          <div class="flex-1 overflow-auto p-4">
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs font-medium uppercase" style="color: ${config.text_color}">
                  <th class="pb-3 pr-4">Usuário</th>
                  <th class="pb-3 pr-4">Perfil</th>
                  <th class="pb-3 pr-4">Criado em</th>
                  <th class="pb-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr class="table-row border-b border-slate-50">
                    <td class="py-3 pr-4 font-medium" style="color: ${config.text_color}">${u.username}</td>
                    <td class="py-3 pr-4">
                      <span class="px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                        ${u.role === 'admin' ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td class="py-3 pr-4 text-sm" style="color: ${config.text_color}">${formatDate(u.createdAt)}</td>
                    <td class="py-3">
                      ${u.role !== 'admin' ? `
                        <button onclick="confirmDeleteUser('${u.__backendId}')" class="px-3 py-1 rounded text-sm font-medium text-white" style="background: ${config.danger_color}">
                          Excluir
                        </button>
                      ` : `<span class="text-xs" style="color: ${config.text_color}">Protegido</span>`}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 max-w-sm mx-4 slide-in">
        <h3 class="text-lg font-bold mb-4" style="color: ${config.text_color}">Confirmar Exclusão</h3>
        <p class="mb-6" style="color: ${config.text_color}">Tem certeza que deseja excluir este usuário?</p>
        <div class="flex gap-3">
          <button onclick="closeDeleteModal()" class="flex-1 px-4 py-2 rounded-lg border-2 font-medium" style="border-color: ${config.primary_color}; color: ${config.primary_color}">
            Cancelar
          </button>
          <button id="confirmDeleteBtn" class="flex-1 px-4 py-2 rounded-lg text-white font-medium" style="background: ${config.danger_color}">
            Excluir
          </button>
        </div>
      </div>
    </div>
  `;
}

let pendingDeleteId = null;

function confirmDeleteUser(backendId) {
  pendingDeleteId = backendId;
  document.getElementById('deleteModal').classList.remove('hidden');
  document.getElementById('confirmDeleteBtn').onclick = () => deleteUser(backendId);
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.add('hidden');
  pendingDeleteId = null;
}

async function deleteUser(backendId) {
  const user = allData.find(d => d.__backendId === backendId);
  if (!user) return;
  
  const result = await window.dataSdk.delete(user);
  if (result.isOk) {
    closeDeleteModal();
    showToast('Usuário excluído com sucesso!', 'success');
  }
}

// Handle new user
async function handleNewUser(e) {
  e.preventDefault();
  
  if (allData.length >= 999) {
    showToast('Limite de registros atingido (999).', 'error');
    return;
  }
  
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newUserPassword').value;
  const role = document.getElementById('newUserRole').value;
  
  // Check if username exists
  const users = allData.filter(d => d.type === 'user');
  if (users.some(u => u.username === username)) {
    showToast('Este usuário já existe!', 'error');
    return;
  }
  
  const result = await window.dataSdk.create({
    type: 'user',
    username: username,
    password: password,
    role: role,
    mustChangePassword: true,
    createdAt: new Date().toISOString()
  });
  
  if (result.isOk) {
    document.getElementById('userForm').reset();
    showToast('Usuário criado! A senha deverá ser trocada no primeiro login.', 'success');
  }
}

// Show reports
function showReports() {
  currentView = 'reports';
  renderReports();
}

function renderReports() {
  const app = document.getElementById('app');
  const visitors = allData.filter(d => d.type === 'visitor');
  
  // Default to last 7 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDateObj = new Date();
  startDateObj.setDate(startDateObj.getDate() - 7);
  const startDate = startDateObj.toISOString().split('T')[0];
  
  app.innerHTML = `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <header class="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button onclick="showDashboard()" class="p-2 rounded-lg hover:bg-slate-100">
            <svg class="w-6 h-6" fill="none" stroke="${config.primary_color}" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 class="text-lg font-bold" style="color: ${config.primary_color}">Relatórios</h1>
        </div>
      </header>
      
      <!-- Filters -->
      <div class="p-4">
        <div class="bg-white rounded-xl p-4 card-shadow">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label class="block text-xs font-medium mb-1" style="color: ${config.text_color}">Data Início</label>
              <input type="date" id="startDate" value="${startDate}" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium mb-1" style="color: ${config.text_color}">Data Fim</label>
              <input type="date" id="endDate" value="${endDate}" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm">
            </div>
            <div>
              <button onclick="filterReport()" class="w-full btn-primary text-white py-2 rounded-lg font-medium text-sm">
                🔍 Filtrar
              </button>
            </div>
            <div>
              <button onclick="exportPDF()" class="w-full py-2 rounded-lg font-medium text-sm border-2" style="border-color: ${config.accent_color}; color: ${config.accent_color}">
                📄 Exportar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Report Table -->
      <div class="flex-1 px-4 pb-4 overflow-hidden">
        <div class="bg-white rounded-xl card-shadow h-full flex flex-col">
          <div class="p-4 border-b border-slate-100">
            <h2 class="text-lg font-bold" style="color: ${config.primary_color}">Registros</h2>
          </div>
          <div class="flex-1 overflow-auto p-4" id="reportContent">
            ${renderReportTable(visitors, startDate, endDate)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderReportTable(visitors, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59);
  
  const filtered = visitors.filter(v => {
    const date = new Date(v.createdAt);
    return date >= start && date <= end;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  if (filtered.length === 0) {
    return `<div class="text-center py-12"><p style="color: ${config.text_color}">Nenhum registro encontrado no período</p></div>`;
  }
  
  const isAdmin = currentUser?.role === 'admin';
  
  return `
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-xs font-medium uppercase" style="color: ${config.text_color}">
          <th class="pb-3 pr-2">Nome</th>
          <th class="pb-3 pr-2">Documento</th>
          <th class="pb-3 pr-2">Tipo</th>
          <th class="pb-3 pr-2">Empresa/Motivo</th>
          <th class="pb-3 pr-2">Reunião Com</th>
          <th class="pb-3 pr-2">Entrada</th>
          <th class="pb-3 pr-2">Op. Entrada</th>
          <th class="pb-3 pr-2">Saída</th>
          <th class="pb-3 pr-2">Op. Saída</th>
          ${isAdmin ? '<th class="pb-3">Ação</th>' : ''}
        </tr>
      </thead>
      <tbody id="reportTableBody">
        ${filtered.map(v => `
          <tr class="table-row border-b border-slate-50" data-id="${v.__backendId}">
            <td class="py-2 pr-2 font-medium" style="color: ${config.text_color}">${v.name}</td>
            <td class="py-2 pr-2" style="color: ${config.text_color}">${v.document}</td>
            <td class="py-2 pr-2">
              <span class="px-2 py-1 rounded text-xs font-medium ${v.visitorType === 'prestador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                ${v.visitorType === 'prestador' ? 'Prestador' : 'Visitante'}
              </span>
            </td>
            <td class="py-2 pr-2" style="color: ${config.text_color}">${v.visitorType === 'prestador' ? v.company : v.visitReason}</td>
            <td class="py-2 pr-2" style="color: ${config.text_color}">${v.meetingWith || '-'}</td>
            <td class="py-2 pr-2" style="color: ${config.text_color}">${formatDateTime(v.entryTime)}</td>
            <td class="py-2 pr-2" style="color: ${config.text_color}">${v.entryOperator}</td>
            <td class="py-2 pr-2" style="color: ${config.text_color}">${v.exitTime ? formatDateTime(v.exitTime) : '-'}</td>
            <td class="py-2 pr-2" style="color: ${config.text_color}">${v.exitOperator || '-'}</td>
            ${isAdmin ? `
              <td class="py-2">
                <button onclick="confirmDeleteVisitor('${v.__backendId}')" class="px-2 py-1 rounded text-xs font-medium text-white" style="background: ${config.danger_color}">
                  Excluir
                </button>
              </td>
            ` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function filterReport() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const visitors = allData.filter(d => d.type === 'visitor');
  document.getElementById('reportContent').innerHTML = renderReportTable(visitors, startDate, endDate);
}

async function confirmDeleteVisitor(backendId) {
  const visitor = allData.find(d => d.__backendId === backendId);
  if (!visitor) return;
  
  // Inline confirmation
  const row = document.querySelector(`tr[data-id="${backendId}"]`);
  if (row) {
    const lastCell = row.lastElementChild;
    lastCell.innerHTML = `
      <div class="flex gap-1">
        <button onclick="deleteVisitor('${backendId}')" class="px-2 py-1 rounded text-xs font-medium text-white" style="background: ${config.danger_color}">
          Confirmar
        </button>
        <button onclick="filterReport()" class="px-2 py-1 rounded text-xs font-medium border" style="border-color: ${config.text_color}; color: ${config.text_color}">
          Cancelar
        </button>
      </div>
    `;
  }
}

async function deleteVisitor(backendId) {
  const visitor = allData.find(d => d.__backendId === backendId);
  if (!visitor) return;
  
  const result = await window.dataSdk.delete(visitor);
  if (result.isOk) {
    showToast('Registro excluído com sucesso!', 'success');
  }
}

// Export to PDF
function exportPDF() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const visitors = allData.filter(d => d.type === 'visitor');
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59);
  
  const filtered = visitors.filter(v => {
    const date = new Date(v.createdAt);
    return date >= start && date <= end;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const title = config.system_title || defaultConfig.system_title;
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório - ${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        h1 { color: #1e3a5f; font-size: 18px; }
        h2 { color: #333; font-size: 14px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #1e3a5f; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; margin-bottom: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>${title}</h1>
          <p>Relatório de Acessos</p>
        </div>
        <div style="text-align: right;">
          <p><strong>Período:</strong> ${formatDate(startDate)} a ${formatDate(endDate)}</p>
          <p><strong>Gerado em:</strong> ${formatDateTime(new Date().toISOString())}</p>
          <p><strong>Operador:</strong> ${currentUser?.username}</p>
        </div>
      </div>
      
      <h2>Total de Registros: ${filtered.length}</h2>
      
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Documento</th>
            <th>Tipo</th>
            <th>Empresa/Motivo</th>
            <th>Reunião Com</th>
            <th>Entrada</th>
            <th>Op. Entrada</th>
            <th>Saída</th>
            <th>Op. Saída</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(v => `
            <tr>
              <td>${v.name}</td>
              <td>${v.document}</td>
              <td>${v.visitorType === 'prestador' ? 'Prestador' : 'Visitante'}</td>
              <td>${v.visitorType === 'prestador' ? v.company : v.visitReason}</td>
              <td>${v.meetingWith || '-'}</td>
              <td>${formatDateTime(v.entryTime)}</td>
              <td>${v.entryOperator}</td>
              <td>${v.exitTime ? formatDateTime(v.exitTime) : '-'}</td>
              <td>${v.exitOperator || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Criado por Thiago Pereira | ${title}</p>
        <p>Documento gerado automaticamente - Os dados são mantidos por 6 meses conforme LGPD</p>
      </div>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

// Utility functions
function formatTime(isoString) {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoString) {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('pt-BR');
}

function formatDateTime(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

function isToday(isoString) {
  const date = new Date(isoString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function logout() {
  currentUser = null;
  showLogin();
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-medium shadow-lg slide-in z-50';
  toast.style.background = type === 'success' ? config.accent_color : config.danger_color;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}