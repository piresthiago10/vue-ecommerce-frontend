const app = new Vue({
    el: '#app',
    data: {
        is_logged: false,
        apiUrl: 'http://0.0.0.0:8000/api/',
        apiToken: '',

        error: false,
        errorMessage: '',
        success: false,
        successMessage: '',
        loading: false,

        customers: [],
        customer: {
            id: '',
            name: ''
        },
        choosenCustomer: '',

        sellers: [],
        seller: {
            id: '',
            name: ''
        },
        choosenSeller: '',

        options: [],
        productSearch: '',
        products: [],
        product: {
            id: '',
            description: '',
            price: ''
        },
        choosenProduct: '',

        quantity: '',

        items: '',
        shopCart: [],
        shopValue: '',
    },
    filters: {
        currency: function (value) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
        }
    },
    methods: {
        login: async function () {
            this.apiToken = ''
            this.is_logged = false
            await axios.post(this.apiUrl + 'login/', {
                username: 'piresthiago10',
                password: 'teste123456'
            })
                .then(response => (
                    this.apiToken = response.data.token,
                    this.is_logged = true,
                    this.getSellers(),
                    this.getCustomers()
                ))
                .catch(function (error) {
                    this.error = true
                    this.errorMessage = 'Não foi possível realizar o acesso. Consulte o nosso atendimento para mais detalhes.'
                    setTimeout(() => { this.error = '' }, 5000);
                    setTimeout(() => { this.errorMessage = '' }, 5000);
                });
        },
        getCustomers: async function () {
            try {
                this.customers = []
                this.responseCustomersData = []
                await axios.get(this.apiUrl + 'customers', {
                    headers: {
                        'Authorization': `Token ${this.apiToken}`
                    }
                })
                    .then(response => (this.responseCustomersData = response.data))
                console.log(this.responseCustomersData)
                for (let i = 0; i < this.responseCustomersData.length; i++) {
                    this.customers.push({
                        'id': this.responseCustomersData[i].id,
                        'name': this.responseCustomersData[i].name,
                    })
                }
            } catch (err) {
                this.error = true
                this.errorMessage = 'Não foi possível obter os clientes. Consulte o nosso atendimento para mais detalhes.'
                setTimeout(() => { this.error = '' }, 5000);
                setTimeout(() => { this.errorMessage = '' }, 5000);
            }
        },
        getSellers: async function () {
            try {
                this.sellers = []
                this.responseSellersData = []
                await axios.get(this.apiUrl + 'sellers', {
                    headers: {
                        'Authorization': `Token ${this.apiToken}`
                    }
                })
                    .then(response => (this.responseSellersData = response.data))
                for (let i = 0; i < this.responseSellersData.length; i++) {
                    this.sellers.push({
                        'id': this.responseSellersData[i].id,
                        'name': this.responseSellersData[i].name,
                    })
                }
            } catch (err) {
                this.error = true
                this.errorMessage = 'Não foi possível obter os vendedores. Consulte o nosso atendimento para mais detalhes.'
            }
        },
        getProducts: async function (event) {
            try {
                if (this.productSearch) {
                    await axios.get(this.apiUrl + 'products/?search=' + this.productSearch, {
                        headers: {
                            'Authorization': `Token ${this.apiToken}`
                        }
                    })
                        .then(response => (this.products = response.data))
                    this.options = []
                    for (let i = 0; i < this.products.length; i = i + 1) {
                        this.options.push({ 'text': this.products[i].description, 'value': this.products[i].id })
                    }
                }
                else {
                    this.products = ''
                    this.options = []
                }
            } catch (error) {
                this.error = true
                this.errorMessage = 'Não foi possível obter os produtos. Consulte o nosso atendimento para mais detalhes.'
                setTimeout(() => { this.error = '' }, 5000);
                setTimeout(() => { this.errorMessage = '' }, 5000);
            }
        },

        onChange: function (event) {
            this.productSearch = document.querySelectorAll('#productSelect option:checked')[0].text
            this.products = ''
            this.options = []
        },

        getProduct: async function () {
            try {
                this.cartProduct = ''
                await axios.get(this.apiUrl + 'products/' + this.choosenProduct + '/', {
                    headers: {
                        'Authorization': `Token ${this.apiToken}`
                    }
                })
                    .then(response => (this.cartProduct = response.data))
            } catch (error) {
                this.error = true
                this.errorMessage = 'Não foi possível obter o produto. Consulte o nosso atendimento para mais detalhes.'
                setTimeout(() => { this.error = '' }, 5000);
                setTimeout(() => { this.errorMessage = '' }, 5000);
            }
            this.product.id = this.cartProduct.id
            this.product.description = this.cartProduct.description
            this.product.price = this.cartProduct.price
        },
        addProductToShoppingCart: function () {
            this.getProduct()
            if (!this.quantity || !this.product.id) {
                this.error = true
                this.errorMessage = 'Verifique o preenchimento do formulário.'
                setTimeout(() => { this.error = '' }, 5000);
                setTimeout(() => { this.errorMessage = '' }, 5000);
            } else {

                this.shopCart.push({
                    "id": this.product.id,
                    "description": this.product.description,
                    "price": this.product.price,
                    "quantity": this.quantity,
                    "total": this.product.price * this.quantity,
                })
                this.calculateShoppingCartValue()
                this.product.id = ''
                this.product.description = ''
                this.product.price = ''
                this.quantity = ''
                this.productSearch = ''
            }
        },
        removeProductToShoppingCart: function (id) {
            let shopCartItem = this.shopCart.find(shopCartItem => shopCartItem.id === id)
            let toRemove = this.shopCart.indexOf(shopCartItem)
            this.shopCart.splice(toRemove, 1);
            this.calculateShoppingCartValue()
        },
        calculateShoppingCartValue: function () {
            this.shopValue = 0
            for (let i = 0; i < this.shopCart.length; i++) {
                this.shopValue += (this.shopCart[i].price * this.shopCart[i].quantity)
            }
        },
        getShopItems: function () {
            this.items = []
            for (let i = 0; i < this.shopCart.length; i++) {
                this.items.push({
                    "product": this.shopCart[i].id,
                    "quantity": parseInt(this.shopCart[i].quantity),
                })
            }
            return this.items
        },
        shopItems: async function () {
            try {
                data = {
                    "seller": this.choosenSeller,
                    "customer": this.choosenCustomer,
                    "items": this.getShopItems()
                }
                console.log(data)
                await axios.post(this.apiUrl + 'sales/', data, {
                    headers: {
                        'Authorization': `Token ${this.apiToken}`
                    }
                })
                    .then(response => (this.cartProduct = response.data,
                        this.success = true,
                        this.successMessage = 'Compra efetivada!'))
                        setTimeout(() => { this.success = '' }, 5000);
                        setTimeout(() => { this.successMessage = '' }, 5000);
            } catch (error) {
                this.error = true
                this.errorMessage = 'Não foi possível realizar a venda. Consulte o nosso atendimento para mais detalhes.'
                setTimeout(() => { this.error = '' }, 5000);
                setTimeout(() => { this.errorMessage = '' }, 5000);
            };
        },
        cancelShop: function () {
            this.shopCart = []
            this.shopValue = ''
            this.choosenCustomer = ''
            this.choosenSeller = ''
            this.success = true
            this.successMessage = 'A venda foi cancelada'
            setTimeout(() => { this.success = '' }, 5000);
            setTimeout(() => { this.successMessage = '' }, 5000);
        },
    },
})