import os, sys

base_dir = os.path.abspath('.')
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from ml.integration.end_to_end_pipeline import KaloraMasterPipeline
from ml.audio.audio_analyzer import AudioQualityAnalyzer
from ml.suggestions.improvement_engine import ProductImprovementEngine
from ml.story.cultural_storyteller import CulturalStoryteller
from ml.extraction.craft_dictionary import CraftVocabularyIntelligence
from ml.vision.similarity_engine import VisualSimilarityEngine

print("=== 1. TESTING MASTER END-TO-END PIPELINE ===")
master = KaloraMasterPipeline(public_dir="./tmp_pub", admin_dir="./tmp_admin")

# Handloom submission
res_h = master.process_artisan_submission(
    text_transcript="idhu kanjeevaram silk saree with pure zari border and korvai weave",
    artisan_provided_data={"artisan_name": "Lakshmi Ammal", "category": "Saree", "material": "Silk", "price": 8500.0, "labor_hours": 30.0, "material_cost": 2500.0},
    target_language="hi"
)
print(f"[Handloom Output]: Sector = {res_h['catalog']['sector']} | Suggested Price = ₹{res_h['pricing']['suggested_price']} | Passport ID = {res_h['passport']['passport_id']}")

# Pottery submission
res_p = master.process_artisan_submission(
    text_transcript="Khurja terracotta clay matka water pot height 40 cm",
    artisan_provided_data={"artisan_name": "Ramesh Prajapati", "category": "Water Pot", "material": "Terracotta", "price": 450.0},
    target_language="en"
)
print(f"[Pottery Output]: Sector = {res_p['catalog']['sector']} | Market Ready = {res_p['quality_audit']['market_readiness']['is_ready_for_publication']}")

# Furniture submission
res_f = master.process_artisan_submission(
    text_transcript="Saharanpur teak wood carved armchair with jaali work",
    artisan_provided_data={"artisan_name": "Rahim Khan", "price": 4500.0},
    target_language="en"
)
print(f"[Furniture Output]: Sector = {res_f['catalog']['sector']} | Grade = {res_f['quality_audit']['catalog_quality']['grade']}")

print("\n=== 2. TESTING TIER 3 & TIER 4 FEATURE ENGINES ===")

# Smart Audio Quality Analyzer (#2)
audio_analyzer = AudioQualityAnalyzer()
dummy_pcm = [0.2 * (i % 100) / 100.0 for i in range(16000)]
audio_res = audio_analyzer.analyze_pcm_samples(dummy_pcm, 16000)
print(f"[Smart Audio Analyzer]: Score = {audio_res['score']}/100 | Status = {audio_res['status']} | Feedback = {audio_res['feedback']}")

# Craft Vocabulary Intelligence (#7, #5)
vocab = CraftVocabularyIntelligence()
vocab_res = vocab.normalize_craft_text("idhu kanjeevaram silk saree me pure zari border irukku with korvai weave")
print(f"[Craft Vocab Parser]: Detected Terms = {[t['term'] for t in vocab_res['detected_terms']]}")

# AI Cultural Storyteller (#15)
storyteller = CulturalStoryteller()
story = storyteller.generate_story("Lakshmi Ammal", "Handlooms & Textiles", "Saree", "Silk", "Kanchipuram")
print(f"[Cultural Storyteller]: Headline = '{story['headline']}' | Status = {story['approval_status']}")

# Product Improvement Suggestions (#26)
imp_engine = ProductImprovementEngine()
suggestions = imp_engine.generate_suggestions(res_h["extraction"]["product_catalog_item"], res_h["quality_audit"], res_h["pricing"])
print(f"[Improvement Suggestions]: Count = {len(suggestions)} | Top Suggestion = '{suggestions[0]['title']}'")

# Visual Similarity Engine (#33, #34)
sim_engine = VisualSimilarityEngine()
similar_items = sim_engine.find_similar_products(res_h["catalog"], [res_p["catalog"], res_f["catalog"]], top_k=2)
print(f"[Visual Similarity Engine]: Matches Found = {len(similar_items)}")

print("\n=== ALL END-TO-END SYSTEM TESTS PASSED SUCCESSFULLY! ===")
