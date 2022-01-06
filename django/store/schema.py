import graphene as gr
from graphene_django import DjangoObjectType

from .models import Category, Product, ProductImage


class CategoryType(DjangoObjectType):
    class Meta:
        model = Category
        fields = ("id", "name", "products", "level", "slug")


class ProductImageType(DjangoObjectType):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text")

    def resolve_image(self, info):
        if self.image:
            self.image = info.context.build_absolute_uri(self.image.url)

        return self.image


class ProductType(DjangoObjectType):
    class Meta:
        model = Product
        fields = ("id", "title", "description", "regular_price", "slug", "product_image")


class Query(gr.ObjectType):
    all_categories = gr.List(CategoryType)
    category_by_name = gr.Field(CategoryType, name=gr.String(required=True))
    all_products = gr.List(ProductType)
    all_products_by_name = gr.Field(ProductType, slug=gr.String(required=True))

    def resolve_all_categories(root, info):
        return Category.objects.filter(level=1)

    def resolve_category_by_name(root, info, name):
        try:
            return Category.objects.get(name=name)
        except Category.DoesNotExist:
            return None

    def resolve_all_products(root, info):
        return Product.objects.all()

    def resolve_all_products_by_name(root, info, slug):
        try:
            return Product.objects.get(slug=slug)
        except Product.DoesNotExist:
            return None


schema = gr.Schema(query=Query)
