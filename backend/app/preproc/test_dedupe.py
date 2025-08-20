from backend.app.preproc.dedupe import DataDeduper

def test_dedupe():
    deduper = DataDeduper()
    items = [{"text": "foo"}, {"text": "foo"}, {"text": "bar"}]
    deduped = deduper.dedupe(items)
    assert len(deduped) == 2
