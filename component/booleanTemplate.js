export function BooleanTemplate(value) {
    if (value === null) {
        return ``
    }
	if(value){
		return `<span style="color:var(--success-h)" class="on-switch"><i class="fas fa-check"></i></span>`
	}else {
		return `<span style="color: var(--error-h)" class="off-switch"><i class="fas fa-times"></i></span>`
	}
}
