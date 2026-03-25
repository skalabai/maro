import os
import sys
import django
import json
import argparse

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maro.settings')
django.setup()

from main.models import Product, Category, ProductGroup

def get_products():
    products = Product.objects.all()
    data = []
    for p in products:
        data.append({
            'id': p.id,
            'title': p.title,
            'price': str(p.price),
            'quantity': p.quantity,
            'category': p.cat.name if p.cat else None,
            'group': p.group.name if getattr(p, 'group', None) else None,
            'color': getattr(p, 'color_name', None),
            'slug': p.slug
        })
    print(json.dumps(data, indent=2, ensure_ascii=False))

def get_categories():
    categories = Category.objects.all()
    data = [{'id': c.id, 'name': c.name, 'slug': c.slug} for c in categories]
    print(json.dumps(data, indent=2, ensure_ascii=False))

def update_product(product_id, field, value):
    try:
        product = Product.objects.get(id=product_id)
        if hasattr(product, field):
            # Try to cast value appropriately if needed
            field_type = type(getattr(product, field))
            if field_type == int:
                value = int(value)
            elif field_type == float:
                value = float(value)
                
            setattr(product, field, value)
            product.save()
            print(json.dumps({"success": True, "message": f"Updated product {product_id}: {field} = {value}"}))
        else:
            print(json.dumps({"success": False, "message": f"Product has no field '{field}'"}))
    except Product.DoesNotExist:
        print(json.dumps({"success": False, "message": f"Product ID {product_id} not found"}))
    except Exception as e:
        print(json.dumps({"success": False, "message": str(e)}))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Maro DB Manager for AI Assistant")
    parser.add_argument("action", choices=["get_products", "get_categories", "update_product"], help="Action to perform")
    parser.add_argument("--id", type=int, help="ID of the item to update")
    parser.add_argument("--field", type=str, help="Field name to update (e.g., price, quantity, title)")
    parser.add_argument("--value", type=str, help="New value for the field")
    
    args = parser.parse_args()
    
    if args.action == "get_products":
        get_products()
    elif args.action == "get_categories":
        get_categories()
    elif args.action == "update_product":
        if args.id is not None and args.field and args.value is not None:
            update_product(args.id, args.field, args.value)
        else:
            print(json.dumps({"success": False, "message": "Missing arguments for update. Requires --id, --field, and --value"}))
