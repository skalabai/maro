# Project Evaluation: Maro

- [x] Analyze project structure and configuration <!-- id: 0 -->
    - [x] Check `manage.py` and project structure <!-- id: 1 -->
    - [x] Review `maro/settings.py` for configuration and security <!-- id: 2 -->
    - [x] Check `requirements.txt` (if exists) or try to infer dependencies <!-- id: 3 -->
- [x] Evaluate core applications <!-- id: 4 -->
    - [x] Review `main` app (models, views, urls) <!-- id: 5 -->
    - [x] Review `cart` app (logic, models, views) <!-- id: 6 -->
- [x] Inspect templates and static files <!-- id: 7 -->
    - [x] Check base templates and inheritance <!-- id: 8 -->
    - [x] Review static asset organization <!-- id: 9 -->
- [x] Synthesize findings and provide feedback <!-- id: 10 -->
- [x] Refactor Code Quality and Architecture <!-- id: 11 -->
    - [x] Refactor `main/models.py` (relationships, field types, typos) <!-- id: 12 -->
    - [x] Refactor `cart/cart.py` (iteration logic) <!-- id: 13 -->
    - [x] Refactor `cart/views.py` (redundancy) <!-- id: 14 -->
- [x] Optimize Performance (N+1 Queries) <!-- id: 15 -->
    - [x] Optimize `main/views.py` with `prefetch_related` <!-- id: 16 -->
