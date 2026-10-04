import assert from 'node:assert/strict';
import test from 'node:test';
import { componentHarness, nodes } from './helpers/componentHarness.mjs';
import * as blessing from '../src/lib/blessing.ts';

test('transfer date has a Thailand maximum on its first render before effects run', async (t) => {
  // 17:30 UTC is already October 5 in Thailand, but still October 4 in UTC.
  t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-04T17:30:00Z') });
  const h = await componentHarness(new URL('../src/components/rsvp/DeclinedResult.tsx', import.meta.url), {
    '@/lib/blessing': blessing,
  });
  const noop = () => {};
  const tree = h.render({
    name: 'Test Guest', amount: '', onAmountChange: noop,
    transferDate: '', onTransferDateChange: noop,
    transferHour: '', onTransferHourChange: noop,
    transferMinute: '', onTransferMinuteChange: noop,
    onSubmit: noop, status: 'idle', error: '', reference: '',
  });
  const date = nodes(tree, n => n.props?.id === 'blessing-date')[0];
  assert.equal(date.props.max, '2026-10-05');
});
