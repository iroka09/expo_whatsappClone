

import { forwardRef, lazy } from "react"
import { Text } from "react-native"
const BottomSheet = lazy(() => import("@gorhom/bottom-sheet"));
const BottomSheetScrollView = lazy(() => import("@gorhom/bottom-sheet").then(x => ({ default: x.BottomSheetScrollView })));
const BottomSheetBackdrop = lazy(() => import("@gorhom/bottom-sheet").then(x => ({ default: x.BottomSheetBackdrop })))




export default forwardRef((props, ref) => {
  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["30%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
          opacity={.8}
          style={{
            backgroundColor: "black"
          }}
        />
      )}
      onChange={(index) => {
        //console.log("index is " + index)
      }}
      {...props}
    >
      <BottomSheetScrollView
        style={{ flex: 1 }}
      >
        {Array(15).fill().map((_, i) => (
          <Text key={i} style={{ fontSize: 30 }}>{i}</Text>
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  )
})