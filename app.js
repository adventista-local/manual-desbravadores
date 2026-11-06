let bancoDeDados = { categorias: [], especialidades: [] };

// 1. Carregar os dados do JSON
async function carregarDados() {
    try {
        const resposta = await fetch('dados.json');
        bancoDeDados = await resposta.json();
        renderizarCategorias();
    } catch (erro) {
        console.error("Erro ao carregar JSON:", erro);
        document.getElementById('categoriesGrid').innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <span class="emoji">⚠️</span>
                <p>Não foi possível carregar os dados. Verifique se o arquivo <strong>dados.json</strong> está na pasta.</p>
            </div>`;
    }
}

// 2. Contar quantas especialidades tem em cada categoria
function contarEspecialidades(catId) {
    return bancoDeDados.especialidades.filter(e => e.categoriaId === catId).length;
}

// 3. Renderizar as Categorias na tela
function renderizarCategorias() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';
    
    bancoDeDados.categorias.forEach(cat => {
        const total = contarEspecialidades(cat.id);
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <span class="card-icon">${cat.icone}</span>
            <h3>${cat.nome}</h3>
            <p>${cat.desc}</p>
            <div class="card-footer">
                <span>${total} ${total === 1 ? 'especialidade' : 'especialidades'}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
        `;
        card.onclick = () => abrirCategoria(cat.id, cat.nome);
        grid.appendChild(card);
    });
}

// 4. Abrir uma categoria e mostrar suas especialidades
function abrirCategoria(catId, catNome) {
    document.getElementById('mainView').classList.add('hidden');
    document.getElementById('specialtiesContainer').classList.remove('hidden');
    document.getElementById('currentCategoryTitle').innerText = catNome;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const lista = document.getElementById('specialtiesList');
    lista.innerHTML = '';
    const especificas = bancoDeDados.especialidades.filter(e => e.categoriaId === catId);
    
    if (especificas.length === 0) {
        lista.innerHTML = `
            <div class="empty-state">
                <span class="emoji">📭</span>
                <p>Nenhuma especialidade cadastrada nesta categoria ainda.</p>
            </div>`;
        return;
    }

    especificas.forEach(esp => {
        const item = document.createElement('div');
        item.className = 'specialty-item';
        item.innerHTML = `
            <div class="specialty-info">
                <span class="specialty-code">${esp.codigo}</span>
                <span class="specialty-name">${esp.nome}</span>
            </div>
            <div class="specialty-tags">
                <span class="tag">Nível ${esp.nivel}</span>
            </div>
        `;
        item.onclick = () => abrirDetalhes(esp);
        lista.appendChild(item);
    });
}

// 5. Voltar para a tela de categorias
function voltarCategorias() {
    document.getElementById('specialtiesContainer').classList.add('hidden');
    document.getElementById('mainView').classList.remove('hidden');
    document.getElementById('searchInput').value = '';
    renderizarCategorias();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 6. Abrir modal com os detalhes/requisitos
function abrirDetalhes(esp) {
    const modal = document.getElementById('detailsView');
    const conteudo = document.getElementById('detailsContent');
    const cat = bancoDeDados.categorias.find(c => c.id === esp.categoriaId);
    const requisitosHTML = esp.requisitos.map(r => `<li>${r}</li>`).join('');
    
    conteudo.innerHTML = `
        <div class="detail-header">
            <span class="detail-code">${esp.codigo}</span>
            <h2>${esp.nome}</h2>
            <div class="detail-meta">
                <span>📁 ${cat ? cat.nome : 'Categoria'}</span>
                <span>📊 Nível ${esp.nivel}</span>
                <span>📅 ${esp.ano}</span>
            </div>
        </div>
        <div class="req-section">
            <h3>Requisitos</h3>
            <ol class="req-list">${requisitosHTML}</ol>
        </div>
    `;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// 7. Fechar modal
function fecharDetalhes() {
    document.getElementById('detailsView').classList.add('hidden');
    document.body.style.overflow = '';
}

// 8. Sistema de busca
document.getElementById('searchInput').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase().trim();
    const grid = document.getElementById('categoriesGrid');
    
    if (!document.getElementById('mainView').classList.contains('hidden')) {
        if (termo.length > 0) {
            const resultados = bancoDeDados.especialidades.filter(esp => 
                esp.nome.toLowerCase().includes(termo) || 
                esp.codigo.toLowerCase().includes(termo) ||
                esp.categoriaId.toLowerCase().includes(termo)
            );
            
            grid.innerHTML = `<h3 style="grid-column: 1 / -1; font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Resultados para "${termo}" <span style="color: #94a3b8; font-weight: 400;">(${resultados.length})</span></h3>`;
            
            if (resultados.length === 0) {
                grid.innerHTML += `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <span class="emoji">🔍</span>
                        <p>Nenhuma especialidade encontrada.</p>
                    </div>`;
            } else {
                resultados.forEach(esp => {
                    const cat = bancoDeDados.categorias.find(c => c.id === esp.categoriaId);
                    const card = document.createElement('div');
                    card.className = 'category-card';
                    card.innerHTML = `
                        <span class="card-icon">${cat ? cat.icone : '📄'}</span>
                        <h3>${esp.nome}</h3>
                        <p>${esp.codigo} • ${cat ? cat.nome : ''}</p>
                    `;
                    card.onclick = () => abrirDetalhes(esp);
                    grid.appendChild(card);
                });
            }
        } else {
            renderizarCategorias();
        }
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharDetalhes();
});

// Inicializar o aplicativo
carregarDados();
