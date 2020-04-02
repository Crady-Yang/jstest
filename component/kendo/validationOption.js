export const ValidationOption = {
  errorTemplate: function (data) {
    console.log(data);  //{ message: "code is required}
    return `<span class="errorMessage">${ data.message }</span>`;
  },
	rules: {
		email: function(input) {
			if (input.is("[type=email]")) {
			  let value = input.val();
				return /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(value)
			}
			return true;
		},
		tel:function (input) {
			if (input.is("[type=tel]")) {
				let value = input.val();
				return /0\d{2}-\d{7,8}/.test(value)
			}
			return true;
		},
		url:function (input) {
			if (input.is("[type=url]")) {
				let value = input.val();
				return /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/.test(value)
			}
			return true;
		}
	},
	// messages: {
	// 	customEmail: "All fields are required"
	// },
  validateInput: function(e) {
    if(!e.valid){
      e.input.addClass('errorInput');
    }else {
	    e.input.removeClass('errorInput');
    }
  },
	validateOnBlur: false
};
