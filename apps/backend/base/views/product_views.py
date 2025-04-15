from base.models import Product, Review
from base.serializers import ProductSerializer
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import os


@api_view(["GET"])
def getProducts(request):
    query = request.query_params.get("keyword", "")
    products = Product.objects.filter(name__icontains=query)

    page = request.query_params.get("page", 1)
    paginator = Paginator(products, 4)

    try:
        products = paginator.page(page)
    except PageNotAnInteger:
        products = paginator.page(1)
    except EmptyPage:
        products = paginator.page(paginator.num_pages)

    serializer = ProductSerializer(products, many=True)

    return Response(
        {"products": serializer.data, "page": int(page), "pages": paginator.num_pages}
    )


@api_view(["GET"])
def getTopProducts(request):
    products = Product.objects.filter(rating__gte=4).order_by("-rating")[:5]
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def getPlanterProducts(request):
    products = Product.objects.filter(category="Planter")
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def getPlantProducts(request):
    products = Product.objects.filter(category="Potted Plants")
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def getEssentialProducts(request):
    products = Product.objects.filter(category="Essentials")
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def getProduct(request, pk):
    product = get_object_or_404(Product, _id=pk)
    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def createProduct(request):
    user = request.user

    product = Product.objects.create(
        user=user,
        name="Sample Name",
        price=0,
        _type="Sample Type",
        countInStock=0,
        category="Sample Category",
        description="",
    )

    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["PUT"])
@permission_classes([IsAdminUser])
def updateProduct(request, pk):
    data = request.data
    product = get_object_or_404(Product, _id=pk)

    try:
        # Validate name
        name = data.get("name")
        if name is not None:
            if not name.strip():
                return Response(
                    {"detail": "Product name cannot be empty"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            product.name = name.strip()

        # Validate price
        price = data.get("price")
        if price is not None:
            try:
                price = float(price)
                if price < 0:
                    return Response(
                        {"detail": "Price cannot be negative"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                product.price = price
            except (ValueError, TypeError):
                return Response(
                    {"detail": "Invalid price value"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Validate stock
        stock = data.get("countInStock")
        if stock is not None:
            try:
                stock = int(stock)
                if stock < 0:
                    return Response(
                        {"detail": "Stock cannot be negative"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                product.countInStock = stock
            except (ValueError, TypeError):
                return Response(
                    {"detail": "Invalid stock value"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Update other fields
        if "category" in data:
            product.category = data["category"]
        if "brand" in data:
            product.brand = data["brand"]
        if "description" in data:
            product.description = data["description"]

        product.save()
        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)

    except Exception as e:
        return Response(
            {"detail": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def deleteProduct(request, pk):
    product = get_object_or_404(Product, _id=pk)
    product.delete()
    return Response(
        {"detail": "Product deleted successfully"}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def uploadImage(request):
    data = request.data

    product_id = data.get("product_id")
    if not product_id:
        return Response(
            {"detail": "Product ID is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    product = get_object_or_404(Product, _id=product_id)
    image = request.FILES.get("image")

    if not image:
        return Response(
            {"detail": "No image file provided"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if image.content_type not in allowed_types:
        return Response(
            {"detail": "Invalid file type. Only JPEG and PNG files are allowed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB in bytes
    if image.size > max_size:
        return Response(
            {"detail": "File size too large. Maximum size is 5MB."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Delete old image if it exists
        if product.image:
            if os.path.isfile(product.image.path):
                os.remove(product.image.path)

        product.image = image
        product.save()

        return Response("Image was uploaded", status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"detail": f"Error uploading image: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def createProductReview(request, pk):
    user = request.user
    product = get_object_or_404(Product, _id=pk)
    data = request.data

    # Check if review already exists
    if product.reviews.filter(user=user).exists():  # Use the `related_name` reviews
        return Response(
            {"detail": "Product already reviewed"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Validate rating
    if data.get("rating") is None or data["rating"] == 0:
        return Response(
            {"detail": "Please provide a valid rating"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create the review
    review = Review.objects.create(
        user=user,
        product=product,
        name=user.first_name or user.username,
        rating=data["rating"],
        comment=data.get("comment", ""),
    )

    # Update product rating and review count
    reviews = product.reviews.all()  # Use `related_name` reviews
    product.numReviews = reviews.count()
    product.rating = sum([review.rating for review in reviews]) / reviews.count()
    product.save()

    return Response(
        {"detail": "Review added successfully"}, status=status.HTTP_201_CREATED
    )
