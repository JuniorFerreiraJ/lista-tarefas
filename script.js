// Classe principal para gerenciar a lista de tarefas
class TodoList {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentEditId = null;
        
        // Elementos do DOM
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTask');
        this.tasksList = document.getElementById('tasksList');
        this.totalTasksSpan = document.getElementById('totalTasks');
        this.completedTasksSpan = document.getElementById('completedTasks');
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggle.querySelector('.theme-icon');
        
        // Inicializar eventos
        this.initEvents();
        this.initTheme();
        this.renderTasks();
        this.updateStats();
    }
    
    // Inicializar eventos
    initEvents() {
        // Adicionar tarefa com Enter ou botão
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        this.addTaskBtn.addEventListener('click', () => {
            this.addTask();
        });
        
        // Alternar tema
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Focar no input quando a página carregar
        this.taskInput.focus();
    }
    
    // Inicializar tema
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }
    
    // Alternar tema
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Salvar preferência
        localStorage.setItem('theme', newTheme);
        
        // Mostrar mensagem
        const themeName = newTheme === 'dark' ? 'escuro' : 'claro';
        this.showMessage(`Tema ${themeName} ativado!`, 'info');
    }
    
    // Definir tema
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Atualizar ícone
        this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        
        // Adicionar animação de transição
        document.body.style.transition = 'all 0.3s ease';
        
        // Remover transição após a animação
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }
    
    // Adicionar nova tarefa
    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (!taskText) {
            this.showMessage('Por favor, digite uma tarefa!', 'error');
            return;
        }
        
        if (this.currentEditId !== null) {
            // Modo de edição
            this.editTask(this.currentEditId, taskText);
        } else {
            // Modo de adição
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            this.tasks.push(newTask);
            this.showMessage('Tarefa adicionada com sucesso!', 'success');
        }
        
        this.taskInput.value = '';
        this.currentEditId = null;
        this.addTaskBtn.textContent = 'Adicionar';
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateStats();
    }
    
    // Editar tarefa
    editTask(id, newText) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].text = newText;
            this.showMessage('Tarefa editada com sucesso!', 'success');
        }
    }
    
    // Deletar tarefa
    deleteTask(id) {
        if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.showMessage('Tarefa deletada!', 'success');
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
        }
    }
    
    // Marcar/desmarcar como concluída
    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
        }
    }
    
    // Iniciar edição
    startEdit(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            this.currentEditId = id;
            this.taskInput.value = task.text;
            this.taskInput.focus();
            this.addTaskBtn.textContent = 'Salvar';
        }
    }
    
    // Renderizar tarefas na tela
    renderTasks() {
        if (this.tasks.length === 0) {
            this.tasksList.innerHTML = `
                <div class="empty-state">
                    <div>📋</div>
                    <p>Nenhuma tarefa ainda. Adicione sua primeira tarefa!</p>
                </div>
            `;
            return;
        }
        
        this.tasksList.innerHTML = this.tasks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${task.completed ? 'checked' : ''}
                           onchange="todoList.toggleTask(${task.id})">
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <div class="task-actions">
                        <button class="btn-edit" onclick="todoList.startEdit(${task.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn-delete" onclick="todoList.deleteTask(${task.id})">
                            🗑️ Deletar
                        </button>
                    </div>
                </div>
            `).join('');
    }
    
    // Atualizar estatísticas
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        
        this.totalTasksSpan.textContent = `Total: ${total} tarefa${total !== 1 ? 's' : ''}`;
        this.completedTasksSpan.textContent = `Concluídas: ${completed}`;
    }
    
    // Salvar no localStorage
    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    // Mostrar mensagens
    showMessage(message, type = 'info') {
        // Remover mensagem anterior se existir
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // Remover mensagem após 3 segundos
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
    
    // Escapar HTML para evitar XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Limpar todas as tarefas
    clearAllTasks() {
        if (this.tasks.length === 0) {
            this.showMessage('Não há tarefas para limpar!', 'error');
            return;
        }
        
        if (confirm('Tem certeza que deseja deletar TODAS as tarefas?')) {
            this.tasks = [];
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
            this.showMessage('Todas as tarefas foram removidas!', 'success');
        }
    }
    
    // Marcar todas como concluídas
    markAllAsCompleted() {
        if (this.tasks.length === 0) {
            this.showMessage('Não há tarefas para marcar!', 'error');
            return;
        }
        
        this.tasks.forEach(task => task.completed = true);
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateStats();
        this.showMessage('Todas as tarefas foram marcadas como concluídas!', 'success');
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.todoList = new TodoList();
    
    // Adicionar algumas tarefas de exemplo se não houver nenhuma
    if (todoList.tasks.length === 0) {
        const exampleTasks = [
            'Estudar JavaScript',
            'Fazer exercícios',
            'Ler um livro',
            'Organizar o quarto'
        ];
        
        exampleTasks.forEach((task, index) => {
            setTimeout(() => {
                todoList.taskInput.value = task;
                todoList.addTask();
            }, index * 500);
        });
    }
});

// Adicionar funcionalidades extras com atalhos de teclado
document.addEventListener('keydown', (e) => {
    // Ctrl + Enter para adicionar tarefa
    if (e.ctrlKey && e.key === 'Enter') {
        todoList.addTask();
    }
    
    // Escape para cancelar edição
    if (e.key === 'Escape' && todoList.currentEditId !== null) {
        todoList.currentEditId = null;
        todoList.taskInput.value = '';
        todoList.addTaskBtn.textContent = 'Adicionar';
        todoList.taskInput.focus();
    }
    
    // Ctrl + A para marcar todas como concluídas
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        todoList.markAllAsCompleted();
    }
    
    // Ctrl + D para limpar todas as tarefas
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        todoList.clearAllTasks();
    }
    
    // Ctrl + T para alternar tema
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        todoList.toggleTheme();
    }
});

// Adicionar informações sobre atalhos
console.log(`
🎯 Lista de Tarefas - Atalhos de Teclado:
• Enter: Adicionar tarefa
• Ctrl + Enter: Adicionar tarefa
• Escape: Cancelar edição
• Ctrl + A: Marcar todas como concluídas
• Ctrl + D: Deletar todas as tarefas
• Ctrl + T: Alternar tema claro/escuro
`);
