from django import forms

class CartAddProductForm(forms.Form):
    quantity = forms.IntegerField(
        min_value=1,
        max_value=10,
        initial=1,
        widget=forms.NumberInput(attrs={
            'class': 'qty-input',
            'id': 'id_quantity'
        })
    )
    override = forms.BooleanField(
        required=False,
        initial=False,
        widget=forms.HiddenInput()
    )