
// Executa apenas se estiver em /conta
if (window.location.pathname.includes('/conta')) {
	


	// Function to fetch all product names from orders and handle UI
	async function fetchOrderProductNames() {
		const accountInfo = await fetch('https://www.goffer.co/conta/editar', { credentials: 'include' });
		
		// Extract email from accountInfo
		let userEmail = null;
		try {
			const accountHtml = await accountInfo.text();
			const accountParser = new DOMParser();
			const accountDoc = accountParser.parseFromString(accountHtml, 'text/html');
			const emailElement = accountDoc.querySelector('#id_email');
			userEmail = emailElement ? emailElement.value.trim() : null;
		} catch (e) {
			// Ignore email extraction error
		}
		try {
			console.log('userEmail:', userEmail);
			// if(!userEmail){
			// 	let uniqueProductNames = [];
			// 	const cached = sessionStorage.getItem('apx_orderProductNames');
			// 	if (cached) {
			// 		try {
			// 			uniqueProductNames = JSON.parse(cached);
			// 		} catch (e) {
			// 			uniqueProductNames = [];
			// 		}
			// 	}
		
			// 	if (!uniqueProductNames || uniqueProductNames.length === 0) {
			// 		// 1. GET /conta/pedido/listar to get the order list
			// 		const ordersResponse = await fetch('https://www.goffer.co/conta/pedido/listar', { credentials: 'include' });
			// 		if (!ordersResponse.ok) return;
			// 		const ordersHtml = await ordersResponse.text();
			// 		const ordersParser = new DOMParser();
			// 		const ordersDoc = ordersParser.parseFromString(ordersHtml, 'text/html');
			// 		// 2. Find all listar_reduzido links
			// 		const orderLinks = Array.from(ordersDoc.querySelectorAll('a[href^="https://www.goffer.co/conta/pedido/"][href$="/listar_reduzido"]'));
			// 		let productNames = [];

			// 		for (const link of orderLinks) {
			// 			try {
			// 				const url = link.href;
			// 				const productResponse = await fetch(url, { credentials: 'include' });
			// 				if (!productResponse.ok) continue;
			// 				const productHtml = await productResponse.text();
			// 				const productParser = new DOMParser();
			// 				const productDoc = productParser.parseFromString(productHtml, 'text/html');
			// 				const spans = productDoc.querySelectorAll('.produto-info > span');
			// 				spans.forEach(span => {
			// 					const name = span.textContent.trim();
			// 					if (name) productNames.push(name);
			// 				});
			// 			} catch (e) {
			// 				// Ignore individual errors
			// 			}
			// 		}

			// 		// Remove duplicates
			// 		uniqueProductNames = productNames.reduce((acc, curr) => {
			// 			if (!acc.includes(curr)) acc.push(curr);
			// 			return acc;
			// 		}, []);

			// 		// Save locally with apx_ prefix using sessionStorage
			// 		sessionStorage.setItem('apx_orderProductNames', JSON.stringify(uniqueProductNames));
			// 	}
			// }
			console.log('userEmail xxxxx:', userEmail);
			// If we have product names, fetch product contents
			// if (userEmail || uniqueProductNames.length > 0) {
			if (userEmail) {	
			// if(!userEmail){
			// 		const idsParam = encodeURIComponent(uniqueProductNames.join(','));
			// 		const productContentsUrl = `https://us-central1-goffer-f0feb.cloudfunctions.net/getProductContents?ids=${idsParam}`;
			// 	}else{
					const productContentsUrl = `https://us-central1-goffer-f0feb.cloudfunctions.net/getProductContents?email=${userEmail}`;
				// }
				console.log('Fetching product contents from:', productContentsUrl);
				try {
					const productContentsResponse = await fetch(productContentsUrl);
					if (productContentsResponse.ok) {
						const productContents = await productContentsResponse.json();
						console.log('Fetched product contents:', productContents);
						if (productContents.products && productContents.products.length > 0) {
							addDigitalProductsTabs();
							renderDigitalProductsSection(productContents.products);
							setupDigitalProductsTabEvents();
						}
						// Adiciona a aba em .minha-conta > .abas-conta e menu-simples
						function addDigitalProductsTabs() {
							// Abas principais
							const tabs = document.querySelector('.minha-conta .abas-conta');
							if (tabs && !tabs.querySelector('.apx-digital-products-tab')) {
								const li = document.createElement('li');
								li.className = 'apx-digital-products-tab';
								li.innerHTML = `<a href="#" class="titulo cor-secundaria"><i class="icon-download-alt"></i> <span>Produtos</span> Digitais</a>`;
								tabs.appendChild(li);
							}
							// Menu simples
							const menu = document.querySelector('.menu-simples');
							if (menu && !menu.querySelector('.apx-digital-products-menu')) {
								const li = document.createElement('li');
								li.className = 'apx-digital-products-menu';
								li.innerHTML = `<a href="#" title="Produtos digitais"><i class="icon-download-alt cor-secundaria"></i> Produtos digitais</a>`;
								menu.prepend(li);
							}
						}

						// Liga eventos de ativação das abas/menu para exibir produtos digitais
						function setupDigitalProductsTabEvents() {
							// Handler para exibir caixa-dados.produtos-digitais
							function showDigitalProductsSection() {
								// Ativa aba/minha-conta
								document.querySelectorAll('.minha-conta .abas-conta li').forEach(li => li.classList.remove('active'));
								const tabLi = document.querySelector('.apx-digital-products-tab');
								if (tabLi) tabLi.classList.add('active');
								// Ativa menu-simples
								document.querySelectorAll('.menu-simples li').forEach(li => li.classList.remove('active'));
								const menuLi = document.querySelector('.apx-digital-products-menu');
								if (menuLi) menuLi.classList.add('active');
								// Exibe caixa-dados.produtos-digitais
								document.querySelectorAll('.conteudo .minha-conta .abas-conteudo > .caixa-dados').forEach(box => {
									if (box.classList.contains('produtos-digitais')) {
										box.style.display = '';
									} else {
										box.style.display = 'none';
									}
								});
							}
							// Liga eventos nos dois botões
							const tabBtn = document.querySelector('.apx-digital-products-tab a');
							if (tabBtn) tabBtn.onclick = (e) => { e.preventDefault(); showDigitalProductsSection(); };
							const menuBtn = document.querySelector('.apx-digital-products-menu a');
							if (menuBtn) menuBtn.onclick = (e) => { e.preventDefault(); showDigitalProductsSection(); };
							// Não ativa por padrão, só ao clicar
						}
					}
				} catch (e) {
					// Ignore errors from product contents fetch
				}
			}
		} catch (e) {
			// Ignore general error
		}
	}


	// Renderiza produtos digitais em .conteudo > .minha-conta > .abas-conteudo
	function renderDigitalProductsSection(products) {
		const container = document.querySelector('.conteudo .minha-conta .abas-conteudo');
		if (!container) return;
		let box = container.querySelector('.caixa-dados.produtos-digitais');
		if (!box) {
			box = document.createElement('div');
			box.className = 'caixa-dados produtos-digitais';
			box.style.display = 'none';
      box.style.margin = '0px';
			box.innerHTML = '<h3 class="titulo cor-secundaria borda-alpha">Produtos Digitais<small> Acesse suas aulas e documentos</small></h3><div class="apx-digital-products-list row-flex" style="margin:2rem 0 4rem 0"></div>';
			container.appendChild(box);
		}
		const listDiv = box.querySelector('.apx-digital-products-list');
		listDiv.innerHTML = '';
		products.forEach((product, idx) => {
			const productDiv = document.createElement('div');
			productDiv.className = 'card span4';
			productDiv.style = 'margin-bottom:16px;';
			productDiv.innerHTML = `
				<div class="card-body row-fluid" style="box-sizing:border-box;padding:0;">
					<div class="" style="margin-bottom:1rem">
						<img src="${product.coverImageUrl}" alt="cover" class="img-polaroid" style="width:100%; aspect-ratio:1; border-radius:6px;" />
					</div>
					<div class="d-block" style="margin-bottom:.5rem; display:block">
						<h4 style="margin:0 0 .5rem 0;">${product.name}</h4>
						<p style="color:#666; font-size:13px; margin-bottom:8px;">${product.description || ''}</p>
					</div>
					<div class="" style="display:flex; align-items:center; justify-content:center;margin-top:1rem">
						<button class="btn btn-primary apx-view-content-btn" style="width:100%" data-idx="${idx}" type="button">Ver Conteúdo</button>
					</div>
				</div>
			`;
			listDiv.appendChild(productDiv);
		});

		// Popup para mostrar conteúdos
		let contentPopup = document.getElementById('apx-digital-content-popup');
		if (!contentPopup) {
			contentPopup = document.createElement('div');
			contentPopup.id = 'apx-digital-content-popup';
			contentPopup.style = 'display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:9999; overflow:auto;';
			contentPopup.innerHTML = `
				<div style="background:#fff; max-width:500px; margin:40px auto; padding:24px; border-radius:8px; position:relative;">
					<button id="apx-digital-content-close" style="position:absolute; top:8px; right:8px; font-size:20px; background:none; border:none; cursor:pointer;">&times;</button>
					<h3 id="apx-digital-content-title" style="margin-top:0;"></h3>
					<div id="apx-digital-content-list"></div>
				</div>
			`;
			document.body.appendChild(contentPopup);
			document.getElementById('apx-digital-content-close').onclick = () => {
				contentPopup.style.display = 'none';
			};
		}

		// Liga evento nos botões Ver Conteúdo
		listDiv.querySelectorAll('.apx-view-content-btn').forEach(btn => {
			btn.onclick = function(e) {
				e.preventDefault();
				const idx = this.getAttribute('data-idx');
				const product = products[idx];
				// Preenche popup
				document.getElementById('apx-digital-content-title').textContent = product.name;
				const contentList = document.getElementById('apx-digital-content-list');
				contentList.innerHTML = '';
				if (product.contents && product.contents.length > 0) {
					product.contents.forEach(content => {
						if (content.type === 'video') {
							const videoBtn = document.createElement('button');
							videoBtn.className = 'btn btn-info';
							videoBtn.textContent = content.title || 'Ver vídeo';
							videoBtn.style = 'display:block; margin-bottom:8px;width:100%;';
							videoBtn.onclick = (ev) => {
								ev.stopPropagation();
								openBunnyPlayer(content.url);
							};
							contentList.appendChild(videoBtn);
						} else if (content.type === 'download') {
							const downloadLink = document.createElement('a');
							downloadLink.className = 'btn';
							downloadLink.textContent = content.title || 'Download';
							downloadLink.href = content.url;
							downloadLink.target = '_blank';
							downloadLink.style = 'display:block; margin-bottom:8px;';
							contentList.appendChild(downloadLink);
						}
					});
				} else {
					contentList.innerHTML = '<div style="color:#999;">Nenhum conteúdo disponível.</div>';
				}
				contentPopup.style.display = 'block';
			};
		});

		// Liga eventos de expandir produto
		listDiv.querySelectorAll('.apx-digital-product-header').forEach(header => {
			header.onclick = function() {
				const idx = this.getAttribute('data-idx');
				const product = products[idx];
				const contentsDiv = this.parentElement.querySelector('.apx-digital-product-contents');
				if (contentsDiv.style.display === 'block') {
					contentsDiv.style.display = 'none';
					contentsDiv.innerHTML = '';
				} else {
					contentsDiv.style.display = 'block';
					contentsDiv.innerHTML = '';
					if (product.contents && product.contents.length > 0) {
						product.contents.forEach(content => {
							if (content.type === 'video') {
								const videoBtn = document.createElement('button');
								videoBtn.textContent = content.title || 'Ver vídeo';
								videoBtn.style = 'display:block; margin-bottom:8px;';
								videoBtn.onclick = (e) => {
									e.stopPropagation();
									openBunnyPlayer(content.url);
								};
								contentsDiv.appendChild(videoBtn);
							} else if (content.type === 'download') {
								const downloadLink = document.createElement('a');
								downloadLink.textContent = content.title || 'Download';
								downloadLink.href = content.url;
								downloadLink.target = '_blank';
								downloadLink.style = 'display:block; margin-bottom:8px;';
								contentsDiv.appendChild(downloadLink);
							}
						});
					} else {
						contentsDiv.innerHTML = '<div style="color:#999;">Nenhum conteúdo disponível.</div>';
					}
				}
			};
		});
	}

	// Abre player Bunny.net em popup simples
	function openBunnyPlayer(url) {
		let playerPopup = document.getElementById('apx-bunny-player-popup');
		const isHtml = url.trim().startsWith('<');
		
		if (!playerPopup) {
			playerPopup = document.createElement('div');
			playerPopup.id = 'apx-bunny-player-popup';
			playerPopup.style = 'display:block; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.7); z-index:10000;';
			
			let contentHtml;
			if (isHtml) {
				contentHtml = `
					<div style="background:#000; max-width:800px; margin:40px auto; padding:0; border-radius:8px; position:relative;">
						<button id="apx-bunny-player-close" style="position:absolute; top:1rem; right:1rem; font-size:30px;z-index:999; background:none; border:none; color:#fff; cursor:pointer;">&times;</button>
						<div id="apx-bunny-player-content" style="width:100%; border:none; border-radius:8px 8px 0 0;">${url}</div>
					</div>
				`;
			} else {
				contentHtml = `
					<div style="background:#000; max-width:800px; margin:40px auto; padding:0; border-radius:8px; position:relative;">
						<button id="apx-bunny-player-close" style="position:absolute; top:8px; right:8px; font-size:20px; background:none; border:none; color:#fff; cursor:pointer;">&times;</button>
						<iframe id="apx-bunny-player-iframe" src="${url}" style="width:100%; height:450px; border:none; border-radius:8px 8px 0 0;" allowfullscreen></iframe>
					</div>
				`;
			}
			
			playerPopup.innerHTML = contentHtml;
			document.body.appendChild(playerPopup);
			document.getElementById('apx-bunny-player-close').onclick = () => {
				playerPopup.style.display = 'none';
				playerPopup.querySelector('#apx-bunny-player-content').innerHTML = '';
			};
		} else {
			if (isHtml) {
				let contentDiv = playerPopup.querySelector('#apx-bunny-player-content');
				if (contentDiv) {
					contentDiv.innerHTML = url;
				}
			} else {
				let iframe = playerPopup.querySelector('#apx-bunny-player-iframe');
				if (iframe) {
					iframe.src = url;
				}
			}
			playerPopup.style.display = 'block';
		}
	}

	// Run the function
	fetchOrderProductNames();
}
