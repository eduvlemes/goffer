/**
 * Goffer - Customizador de Produtos
 * Versão em Vanilla JavaScript
 */

'use strict';

// Configurações e dados

window.customizer = window.customizer || [];

/**
 * Funções utilitárias
 */
const GofferUtils = {
  /**
   * Obtém a última classe de uma string de classes
   * @param {string} classString - String contendo as classes
   * @return {string} A última classe da string
   */
  getLastClass(classString) {
    if (!classString) return '';
    const classes = classString.trim().split(/\s+/);
    return classes[classes.length - 1];
  },

  /**
   * Encontra o elemento ancestral mais próximo que corresponda ao seletor
   * @param {HTMLElement} element - Elemento a partir do qual buscar
   * @param {string} selector - Seletor CSS para buscar
   * @return {HTMLElement|null} Elemento encontrado ou null
   */
  closest(element, selector) {
    if (!element) return null;
    if (element.matches(selector)) return element;
    
    let parent = element.parentElement;
    while (parent) {
      if (parent.matches(selector)) return parent;
      parent = parent.parentElement;
    }
    return null;
  },

  /**
   * Obtém o valor de um atributo data-* de um elemento
   * @param {HTMLElement} element - Elemento do qual obter o atributo
   * @param {string} name - Nome do atributo (sem o prefixo data-)
   * @return {string} Valor do atributo
   */
  getData(element, name) {
    return element.dataset[name] || element.getAttribute(`data-${name}`);
  },

  /**
   * Scroll suave para um elemento
   * @param {HTMLElement} element - Elemento para o qual fazer scroll
   * @param {number} offset - Offset a ser aplicado
   */
  scrollTo(element, offset = 0) {
    if (!element) return;
    
    const top = element.getBoundingClientRect().top + window.pageYOffset + offset;
    
    window.scrollTo({
      top: top,
      behavior: 'smooth'
    });
  },

  /**
   * Gerencia operações de sessionStorage
   */
  storage: {
    /**
     * Obtém dados do sessionStorage
     * @param {string} key - Chave para obter dados
     * @return {Array} Dados obtidos como array
     */
    get(key) {
      let data = [];
      const saved = sessionStorage.getItem(key);
      
      if (saved) {
        try {
          data = JSON.parse(saved);
          if (!Array.isArray(data)) data = [data];
        } catch (e) {
          console.error('Erro ao processar dados do sessionStorage:', e);
          data = [];
        }
      }
      
      return data;
    },
    
    /**
     * Salva dados no sessionStorage
     * @param {string} key - Chave para salvar os dados
     * @param {any} data - Dados a serem salvos
     */
    set(key, data) {
      sessionStorage.setItem(key, JSON.stringify(data));
    },
    
    /**
     * Remove dados do sessionStorage
     * @param {string} key - Chave a ser removida
     */
    remove(key) {
      sessionStorage.removeItem(key);
    }
  },

  /**
   * Manipulação de DOM
   */
  dom: {
    /**
     * Cria um elemento com atributos e conteúdo
     * @param {string} tag - Tag do elemento
     * @param {Object} attrs - Atributos a serem definidos
     * @param {string|HTMLElement|Array} content - Conteúdo ou filhos
     * @return {HTMLElement} O elemento criado
     */
    createElement(tag, attrs = {}, content = null) {
      const element = document.createElement(tag);
      
      // Define atributos
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'class' || key === 'className') {
          element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value);
        } else if (key.startsWith('data-')) {
          element.setAttribute(key, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
          element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
          element.setAttribute(key, value);
        }
      });
      
      // Adiciona conteúdo
      if (content !== null) {
        if (typeof content === 'string') {
          element.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          element.appendChild(content);
        } else if (Array.isArray(content)) {
          content.forEach(item => {
            if (item instanceof HTMLElement) {
              element.appendChild(item);
            } else if (typeof item === 'string') {
              element.appendChild(document.createTextNode(item));
            }
          });
        }
      }
      
      return element;
    }
  }
};

/**
 * Gerenciador de customizações do produto
 */
class ProductCustomizer {
  /**
   * Construtor do customizador
   * @param {Object} config - Configuração do customizador
   */
  constructor(config) {
    this.config = config;
    this.customizerElement = null;
    this.selectedOptionsElement = null;
    this.customizationContainers = [];
  }

  /**
   * Inicializa o customizador
   */
  init() {
    // Cria o HTML do customizador
    this.renderCustomizer();
    
    // Configura os eventos
    this.setupEvents();
    
    // Inicializa o estado
    this.updateSelectedOptions();
  }

  /**
   * Renderiza o HTML do customizador
   */
  renderCustomizer() {
    // Cria o contêiner principal do customizador
    this.customizerElement = GofferUtils.dom.createElement('div', { id: 'customizer' }, [
      GofferUtils.dom.createElement('div', { class: 'titulo' }, this.config.title),
      GofferUtils.dom.createElement('div', { class: 'customizer-content' })
    ]);
    
    // Adiciona as customizações
    const contentEl = this.customizerElement.querySelector('.customizer-content');
    
    this.config.customizations.forEach(customization => {
      // Gera o HTML das opções
      const optionsHtml = customization.options.map(option => {
        const disabledClass = option.enabled === false ? 'disabled' : '';
        const dataAttrs = {
          'data-label': option.label
        };
        
        if (option.image && option.image.trim() !== '') {
          dataAttrs['data-image'] = option.image;
          return `<div class="option ${disabledClass}" data-label="${option.label}" data-image="${option.image}"><img loading="lazy" src="${option.image}" alt="${option.label}" class="option-image"> <span>${option.label}</span></div>`;
        } else {
          return `<div class="option ${disabledClass}" data-label="${option.label}"><span>${option.label}</span></div>`;
        }
      }).join('');
      
      // Define as classes baseadas nas variantes ativas
      const enabledClasses = customization.enableOnVariants.length > 0 
        ? customization.enableOnVariants.map(v => `enabled-${v}`).join(' ') 
        : 'enabled-all';
      
      // Cria o contêiner da customização
      const customizationHtml = `
        <div class="customization ${customization.enableOnVariants.length > 0 ? 'hide' : 'enabled-all'} ${enabledClasses}">
          <div class="customization-title">${customization.title}</div>
          <div class="customization-options">${optionsHtml}</div>
        </div>
      `;
      
      contentEl.insertAdjacentHTML('beforeend', customizationHtml);
      this.customizationContainers.push(contentEl.lastElementChild);
    });
    
    // Adiciona a div de opções selecionadas (inicialmente oculta)
    this.selectedOptionsElement = GofferUtils.dom.createElement('div', 
      { id: 'selected-options', style: 'display: none;' }, 
      [
        GofferUtils.dom.createElement('h3', {}, 'Opções Selecionadas'),
        GofferUtils.dom.createElement('div', { class: 'selected-list' })
      ]
    );
    
    this.customizerElement.appendChild(this.selectedOptionsElement);
    
    // Insere o customizador no documento, antes do primeiro botão de ação do produto
    const firstActionButton = document.querySelector('.principal .acoes-produto');
    if (firstActionButton) {
      firstActionButton.parentNode.insertBefore(this.customizerElement, firstActionButton);
    }
  }

  /**
   * Configura os eventos do customizador
   */
  setupEvents() {
    // Evento para selecionar opção
    this.customizerElement.addEventListener('click', (event) => {
      const option = event.target.closest('.option:not(.disabled)');
      if (!option) return;
      
      // Remove seleção anterior do mesmo grupo
      const customizationOptions = GofferUtils.closest(option, '.customization-options');
      customizationOptions.querySelectorAll('.option.selected').forEach(el => {
        el.classList.remove('selected');
      });
      
      // Adiciona a classe selected à opção clicada
      option.classList.add('selected');
      
      // Atualiza a lista de opções selecionadas
      this.updateSelectedOptions();
      
      // Encontra a próxima customização visível
      const currentCustomization = GofferUtils.closest(option, '.customization');
      
      // Verifica se todas as customizações visíveis têm uma opção selecionada
      let allSelected = true;
      let nextVisibleCustomization = null;
      
      let foundCurrent = false;
      this.customizationContainers.forEach(customization => {
        if (!customization.classList.contains('hide')) {
          const hasSelection = customization.querySelector('.option.selected') !== null;
          if (!hasSelection) {
            allSelected = false;
          }
          
          // Encontra a próxima customização após a atual
          if (foundCurrent && !nextVisibleCustomization) {
            nextVisibleCustomization = customization;
          }
          
          if (customization === currentCustomization) {
            foundCurrent = true;
          }
        }
      });
      
      // Define para onde fazer o scroll
      if (allSelected) {
        // Rola para a seção de opções selecionadas
        GofferUtils.scrollTo(this.selectedOptionsElement, -100);
      } else if (nextVisibleCustomization) {
        // Rola para a próxima customização
        GofferUtils.scrollTo(nextVisibleCustomization, -100);
      }
    });
    
    // Evento para botão comprar
    document.addEventListener('click', (event) => {
      const buyButton = event.target.closest('.botao-comprar');
      if (!buyButton) return;
      
      event.preventDefault();
      
      if (typeof theme !== 'undefined' && theme.functions && theme.functions.blockPage) {
        theme.functions.blockPage(true);
      }
      
      // SKU do produto
      const actionContainer = GofferUtils.closest(buyButton, '.acoes-produto');
      const sku = actionContainer ? GofferUtils.getLastClass(actionContainer.className) : '';
      const produtoId = actionContainer ? parseInt(GofferUtils.getData(actionContainer, 'produtoId')) : 0;
      const href = buyButton.getAttribute('href');
      
      // Opções selecionadas
      const customOptions = [];
      
      // Coleta todas as opções selecionadas de customizações visíveis
      this.customizerElement.querySelectorAll('.customization:not(.hide) .option.selected').forEach(option => {
        const label = option.querySelector('span').textContent;
        const customTitle = GofferUtils.closest(option, '.customization').querySelector('.customization-title').textContent;
        const imgElement = option.querySelector('img');
        const image = imgElement ? imgElement.getAttribute('src') : '';
        
        customOptions.push({ customTitle, label, image });
      });
      
      // Salva no sessionStorage
      const newItem = {
        sku,
        produtoId,
        customizations: customOptions
      };
      
      const savedItems = GofferUtils.storage.get('goffer_customizer');
      
      // Verifica se já existe o SKU
      let found = false;
      for (let i = 0; i < savedItems.length; i++) {
        if (savedItems[i].sku === sku) {
          savedItems[i].customizations = customOptions;
          found = true;
          break;
        }
      }
      
      if (!found) {
        savedItems.push(newItem);
      }
      
      GofferUtils.storage.set('goffer_customizer', savedItems);
      
      // Redireciona após um pequeno delay para garantir que o sessionStorage foi atualizado
      setTimeout(() => {
        window.location = href;
      }, 100);
    });
    
    // Evento para seleção de variante
    document.addEventListener('click', (event) => {
      const variantLink = event.target.closest('a[data-variacao-id]');
      if (!variantLink) return;
      
      const variacaoId = GofferUtils.getData(variantLink, 'variacaoId');
      
      // Atualiza a visibilidade das customizações
      this.customizationContainers.forEach(customization => {
        const hasEnabledClass = 
          customization.classList.contains('enabled-all') || 
          customization.classList.contains(`enabled-${variacaoId}`);
        
        if (hasEnabledClass) {
          customization.classList.remove('hide');
        } else {
          customization.classList.add('hide');
          // Remove seleções de customizações ocultas
          customization.querySelectorAll('.option.selected').forEach(option => {
            option.classList.remove('selected');
          });
        }
      });
      
      // Consulta sessionStorage para personalização do SKU
      const acoesProdutoElement = document.querySelector(`.acoes-produto[data-variacao-id="${variacaoId}"]`);
      const sku = acoesProdutoElement ? GofferUtils.getLastClass(acoesProdutoElement.className) : '';
      const savedItems = GofferUtils.storage.get('goffer_customizer');
      const item = savedItems.find(i => i.sku === sku);
      
      // Remove aviso anterior
      const existingWarning = document.querySelector('.aviso-personalizado-carrinho');
      if (existingWarning) {
        existingWarning.remove();
      }
      
      // Exibe aviso se já existe personalização para o SKU
      if (item && item.customizations && item.customizations.length > 0) {
        const atributos = document.querySelector('.atributos');
        if (atributos) {
          const warningElement = GofferUtils.dom.createElement('div', 
            { class: 'alert alert-danger aviso-personalizado-carrinho' }, 
            `${aviso_titulo}<small>${aviso_mensagem}</small>`
          );
          atributos.after(warningElement);
          
          // Adiciona atributo disabled ao .acoes-produto correspondente
          const productAction = document.querySelector(`.acoes-produto.${sku}`);
          if (productAction) {
            productAction.setAttribute('disabled', 'true');
          }
        }
      }
      
      // Limpa seleções atuais
      this.customizerElement.querySelectorAll('.option.selected').forEach(option => {
        option.classList.remove('selected');
      });
      
      // Restaura seleções salvas
      if (item && item.customizations) {
        item.customizations.forEach(opt => {
          this.customizationContainers.forEach(customization => {
            const title = customization.querySelector('.customization-title').textContent;
            if (title === opt.customTitle) {
              customization.querySelectorAll('.option').forEach(option => {
                if (GofferUtils.getData(option, 'label') === opt.label) {
                  option.classList.add('selected');
                }
              });
            }
          });
        });
      }
      
      // Atualiza a exibição das opções selecionadas
      this.updateSelectedOptions();
    });
  }

  /**
   * Atualiza a visualização das opções selecionadas
   */
  updateSelectedOptions() {
    const selectedOptions = [];
    
    // Coleta todas as opções selecionadas
    this.customizerElement.querySelectorAll('.customization:not(.hide) .option.selected').forEach(option => {
      const label = GofferUtils.getData(option, 'label');
      const image = GofferUtils.getData(option, 'image');
      const customTitle = GofferUtils.closest(option, '.customization').querySelector('.customization-title').textContent;
      
      selectedOptions.push({ label, image, customTitle });
    });
    
    // Verifica se há opções selecionadas
    if (selectedOptions.length > 0) {
      // Se há opções selecionadas, exibe a seção
      this.selectedOptionsElement.style.display = 'block';
      
      // Cria o HTML das opções selecionadas
      const html = selectedOptions.map(opt => {
        if (opt.image) {
          return `<div class="selected-option-case"><strong>${opt.customTitle}:</strong><div class="selected-option"><img src="${opt.image}" alt="${opt.label}" class="option-image"> <span>${opt.label}</span></div></div>`;
        } else {
          return `<div class="selected-option-case"><strong>${opt.customTitle}:</strong><div class="selected-option"><span>${opt.label}</span></div></div>`;
        }
      }).join('');
      
      // Atualiza o conteúdo da lista
      this.selectedOptionsElement.querySelector('.selected-list').innerHTML = html;
    } else {
      // Se não há opções selecionadas, oculta a seção
      this.selectedOptionsElement.style.display = 'none';
    }
  }
}

/**
 * Gerenciador de carrinho
 */
class CartManager {
  /**
   * Inicializa o gerenciador de carrinho
   */
  init() {
    this.setupProductItems();
    this.setupObservationsField();
  }
  
  /**
   * Configura os itens de produto no carrinho
   */
  setupProductItems() {
    // Busca todos os itens de produto no carrinho
    const productItems = document.querySelectorAll('[data-produto-id]');
    
    productItems.forEach(item => {
      const produtoId = parseInt(GofferUtils.getData(item, 'produtoId'));
      const savedItems = GofferUtils.storage.get('goffer_customizer');
      
      // Na página de carrinho, usamos apenas o produtoId para identificação
      // sem depender do SKU que pode estar nas classes
      
      // Busca apenas pelo produtoId
      const savedItem = savedItems.find(i => i.produtoId == produtoId);
      console.log(savedItem)
      // Se encontramos um item com personalizações
      if (savedItem && savedItem.customizations && savedItem.customizations.length > 0) {
        // Define quantidade como 1
        const quantityElement = item.querySelector('.quantidade');
        if (quantityElement) {
          quantityElement.textContent = '1';
        }
        
        // Adiciona classe para identificar produto personalizado
        item.classList.add('produto-personalizado');
        
        // Configura o link de exclusão
        const deleteLink = item.querySelector('.excluir a');
        if (deleteLink) {
          deleteLink.addEventListener('click', (e) => {
            e.preventDefault();
            const href = deleteLink.getAttribute('href');
            
            // Mostra indicador de carregamento
            if (typeof theme !== 'undefined' && theme.functions && theme.functions.blockPage) {
              theme.functions.blockPage(true);
            }
            
            // Remove do sessionStorage usando apenas o produtoId
            const savedItems = GofferUtils.storage.get('goffer_customizer');
            const initialLength = savedItems.length;
            
            // Filtramos mantendo apenas os itens que não correspondem ao produtoId atual
            const filteredItems = savedItems.filter(i => i.produtoId != produtoId);
            
            // Verifica se algo foi removido
            if (filteredItems.length < initialLength) {
              console.log("Personalização removida com sucesso");
            } else {
              console.warn("Nenhuma personalização encontrada para remover");
            }
            
            // Salva o array atualizado
            GofferUtils.storage.set('goffer_customizer', filteredItems);
            
            // Redireciona após um pequeno delay
            setTimeout(() => {
              window.location = href;
            }, 100);
          });
        }
        
        // Adiciona as personalizações à lista do produto
        const ulElement = item.querySelector('ul');
        if (ulElement) {
          savedItem.customizations.forEach(opt => {
            let liContent = `${opt.customTitle}:&nbsp; <strong>${opt.label}</strong>`;
            if (opt.image) {
              liContent += ` <img src="${opt.image}" alt="${opt.label}" style="max-width:32px;max-height:32px;vertical-align:middle;">`;
            }
            
            const liElement = document.createElement('li');
            liElement.innerHTML = liContent;
            ulElement.appendChild(liElement);
          });
        }
      }
    });
  }
  
  /**
   * Configura o campo de observações no carrinho
   */
  setupObservationsField() {
    const clienteObs = document.querySelector('[name="cliente_obs"]');
    if (!clienteObs) return;
    
    // Função para gerar o texto das personalizações
    const getCustomizationText = (userText = '') => {
      let customizerData = '';
      
      // Obtém dados do customizador
      const savedItems = GofferUtils.storage.get('goffer_customizer');
      
      // Adiciona informações de personalização se existirem
      if (savedItems.length > 0) {
        customizerData = '\n\n--- Personalizações ---\n';
        savedItems.forEach(item => {
          customizerData += `SKU: ${item.sku}\n`;
          if (item.customizations) {
            item.customizations.forEach(opt => {
              customizerData += `- ${opt.customTitle}: ${opt.label}\n`;
            });
            customizerData += '----------------------\n';
          }
        });
        
      }
      
      return userText + customizerData;
    };
    
    // Cria uma duplicata do campo para edição
    const duplicata = clienteObs.cloneNode();
    duplicata.setAttribute('name', 'cliente_obs_dup');
    duplicata.value = '';
    
    // Insere a duplicata após o campo original
    clienteObs.parentNode.insertBefore(duplicata, clienteObs.nextSibling);
    
    // Oculta o campo original
    clienteObs.style.display = 'none';
    
    // Inicializa o campo original com as personalizações imediatamente
    clienteObs.value = getCustomizationText();
    
    // Adiciona listener de entrada
    duplicata.addEventListener('input', () => {
      // Atualiza o campo original com o texto do usuário e as personalizações
      clienteObs.value = getCustomizationText(duplicata.value);
    });
  }
}

/**
 * Inicialização quando o documento estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa em páginas de produto
  if (document.querySelector('.pagina-produto')) {
    // Seleciona a primeira variação por padrão (se existir)
    const firstVariation = document.querySelector('.atributos li:first-child a');
    if (firstVariation) {
      firstVariation.click();
      
      // Damos tempo para o evento de clique propagar e processar
      setTimeout(() => {
        // Verificar se há personalizações salvas para o SKU atual
        const variacaoId = GofferUtils.getData(firstVariation, 'variacaoId');
        if (variacaoId) {
          const acoesProdutoElement = document.querySelector(`.acoes-produto[data-variacao-id="${variacaoId}"]`);
          const sku = acoesProdutoElement ? GofferUtils.getLastClass(acoesProdutoElement.className) : '';
          
          if (sku) {
            const savedItems = GofferUtils.storage.get('goffer_customizer');
            const item = savedItems.find(i => i.sku === sku);
            
            // Se houver personalizações salvas, exibe o aviso
            if (item && item.customizations && item.customizations.length > 0) {
              const atributos = document.querySelector('.atributos');
              if (atributos) {
                const warningElement = GofferUtils.dom.createElement('div', 
                  { class: 'alert alert-danger aviso-personalizado-carrinho' }, 
                  `${aviso_titulo}<small>${aviso_mensagem}</small>`
                );
                atributos.after(warningElement);
                
                // Adiciona atributo disabled ao .acoes-produto correspondente
                if (acoesProdutoElement) {
                  acoesProdutoElement.setAttribute('disabled', 'true');
                }
              }
            }
          }
        }
      }, 200); // Pequeno delay para garantir que o evento de clique foi processado
    }
    
    // Verifica se há um customizador para o produto atual
    const productConfig = window.customizer.find(item => item.productId === parseInt(window.PRODUTO_ID));
    if (productConfig) {
      const productCustomizer = new ProductCustomizer(productConfig);
      productCustomizer.init();
    }
  }
  
  // Limpa os dados do customizador quando o pedido for finalizado
  if (document.querySelector('.pagina-pedido-finalizado')) {
    GofferUtils.storage.remove('goffer_customizer');
  }
  
  // Inicializa em páginas de carrinho
  if (document.querySelector('.pagina-carrinho')) {
    const cartManager = new CartManager();
    cartManager.init();
  }
});
