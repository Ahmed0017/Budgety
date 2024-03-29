//BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expenses = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
        
        
        Expenses.prototype.calcPercentage = function(totalIncome) {
            if(totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            }
        };
        
        Expenses.prototype.getPercentage = function() {
            return this.percentage;
        }
        
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItem[type].forEach(function(cur) {
            sum += cur.value;
            
        });
        
        data.totals[type] = sum;
        
    };
    
    var data = {
        allItem: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // ID = Last ID + 1
            
            // Create new ID
            if (data.allItem[type].length > 0) {
                ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            
            // Create new item based on 'exp' or 'inc' type
            if (type === 'exp') {
                newItem = new Expenses(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItem[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        
        deleteItem: function(type, id) {
          var ids, index;
            ids = data.allItem[type].map(function(current) {
               
                return current.id;
            });
            
           index = ids.indexOf(id); // -1
            
            if(index !== -1) {
                data.allItem[type].splice(index, 1); 
            }
            
        },
        
        calculateBudget: function() {
          
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
            }
            
        },
        
        calculatePercentages: function() {
            
            data.allItem.exp.forEach(function(cur) {  
               cur.calcPercentage(data.totals.inc); 
            });
        },
        
        getPercentage: function() {
          
            var allPerc = data.allItem.exp.map(function(cur) {
                return cur.getPercentage();
                
            });  
            return allPerc;
        },
        
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            //calculateTotal("inc");
            console.log(data);
        }
    };
    
})();



// UI CONTOLLER
var UIController = (function() {
    
    var DOMstringes = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    


    var formatNumber =  function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3 && int.length < 7) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        } else if(int.length > 6) {
            int = int.substr(0, int.length - 6) + ',' + int.substr(int.length - 6, 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    
    var nodeListForEach = function(list, callback) {
        
       for(var i = 0; i < list.length; i++) {

           callback(list[i], i);
       }    
    };
    
    return {
        getInput: function() {
            
            return {
                type: document.querySelector(DOMstringes.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstringes.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstringes.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element, fields, fieldsArr;
            
            // Create HTML string with some placeholder text     
            if (type === 'inc') {
                element = DOMstringes.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline" id = "test"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstringes.expensesContainer;
                
               html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
            }
            
            // Replace the placeholder text with some actual data    
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        clearFields: function() {
            fields = document.querySelectorAll(DOMstringes.inputDescription + ',' + DOMstringes.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                
                current.value = "";
                
            });
            
            fieldsArr[0].focus();

        },
        
        displayBudget: function(obj) {
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstringes.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstringes.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstringes.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstringes.percentageLabel).textContent = obj.percentage + '%';  
            } else {
                document.querySelector(DOMstringes.percentageLabel).textContent = '---';
            }
            
        },
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstringes.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'; 
                } else {
                    current.textContent = '___';
                  }             
                
            });
        },
        
        displayMonth: function() {
          var now, months, month, year;
            now = new Date();        
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            month = now.getMonth();
            
            year = now.getFullYear();
            
            document.querySelector(DOMstringes.dateLabel).textContent = months[month] + ' ' + year;
            
        },
             
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstringes.inputType + ',' +
                DOMstringes.inputDescription + ',' +
                DOMstringes.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstringes.inputBtn).classList.toggle('red');
        },
        
        getDOMstringes: function() {
            return DOMstringes;
        }
    };
    
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstringes();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
    
            if (event.keyCode === 13 || event.which === 13) {

                ctrlAddItem();
            }

        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
    };
    
    var updateBudget = function() {

        // 1. Calculate the budget
        budgCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgCtrl.getBudget();

        // 3. Display the budget to the UI
        UICtrl.displayBudget(budget);
    }
    
    var updatePercentage = function() {
        
        // 1. Calculate the percentages
        budgCtrl.calculatePercentages();
        
        // 2. Read the percentages from the budget controller
        var percentages = budgCtrl.getPercentage();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }
    
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the field input data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            // 2. Add the item to the budget contoller
            newItem = budgCtrl.addItem(input.type, input.description, input.value);
            
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Calculate and update the percentages
            updatePercentage();

        }
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
       
        if (itemID) {
            splitID = itemID.split('-');    
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from the data structure
            budgCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Updata and show the new budget
            updateBudget();
            
            // 4. Calculate and update the percentages
            updatePercentage();            
        }
        
        
        
    };
    
    return {
        init: function() {
            console.log('application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            return setupEventListeners();
            
        }
    };


})(budgetController, UIController);


controller.init();