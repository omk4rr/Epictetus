from backend.app.preproc.cleaner import DataCleaner

def test_clean():
    cleaner = DataCleaner()
    items = [{"text": "  hello  "}]
    cleaned = cleaner.clean(items)
    assert cleaned[0]["text"] == "hello"
