import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { useQuery } from "react-query";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { API_KEY, BASE_PATH, IGetSearchResult } from "../api";
import { makeImagePath } from "../utils";

const Wrapper = styled.div`
  background: black;
  padding-bottom: 200px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Slider = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  top: 200px;
`;

const SliderTitle = styled.h1`
  position: absolute;
  font-size: 30px;
  margin-left: 15px;
  top: -50px;
`;

const Row = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  font-size: 66px;
  position: relative;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 15px;
    font-weight: 600;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 30vw;
  height: 60vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 45%;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 30px;
  position: relative;
  top: -80px;
`;

const BigOverview = styled.p`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  position: relative;
  top: -80px;
  font-size: 15px;
`;

const BigDetail = styled.div`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  top: -100px;
  font-size: 20px;
`;

/* const rowVars = {
  hidden: (leaving: boolean) => ({
    x: leaving ? -window.outerWidth + 6 : window.outerWidth - 6,
  }),
  visible: {
    x: 0,
  },
  exit: (leaving: boolean) => ({
    x: leaving ? window.outerWidth - 6 : -window.outerWidth + 6,
  }),
}; */

const boxVars = {
  normal: {
    scale: 1,
  },
  hover: {
    zIndex: 98,
    scale: 1.3,
    y: -50,
    transition: {
      delay: 0.4,
      type: "tween",
    },
  },
};

/* const infoVars = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.1,
      type: "tween",
    },
  },
}; */

function Search() {
  const location = useLocation();
  const history = useHistory();
  const keyword = new URLSearchParams(location.search).get("keyword");
  const { scrollY } = useViewportScroll();
  function getSearchResults() {
    return fetch(
      `${BASE_PATH}/search/multi?api_key=${API_KEY}&language=ko-kr&query=${keyword}`
    ).then((response) => response.json());
  }
  const bigSearchingMatch = useRouteMatch<{ resultId: string }>(
    "/search/:resultId"
  );
  const { data: data, isLoading } = useQuery<IGetSearchResult>(
    ["result", "search"],
    getSearchResults
  );
  const onBoxClicked = (resultId: number) => {
    history.push(`/search/${resultId}`);
  };
  const onOverlayClicked = () => history.push(`/search?keyword=${keyword}`);
  const clickedResult =
    bigSearchingMatch?.params.resultId &&
    data?.results.find(
      (result) => String(result.id) === bigSearchingMatch?.params.resultId
    );
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Slider>
            <SliderTitle>Results</SliderTitle>
            <AnimatePresence initial={false}>
              <Row>
                {data?.results.slice(0, 20).map((result) => (
                  <Box
                    layoutId={result.id + ""}
                    key={result.id}
                    variants={boxVars}
                    initial="normal"
                    whileHover="hover"
                    onClick={() => onBoxClicked(result.id)}
                    transition={{ type: "tween" }}
                    bgPhoto={makeImagePath(result.backdrop_path, "w500")}
                  >
                    <Info>
                      <h4>{result.title || result.name}</h4>
                    </Info>
                  </Box>
                ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <AnimatePresence>
            {bigSearchingMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClicked}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigMovie
                  layoutId={bigSearchingMatch.params.resultId}
                  style={{ top: scrollY.get() + 250 }}
                >
                  {clickedResult && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedResult.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>
                        {clickedResult.title || clickedResult.name}
                      </BigTitle>
                      <BigOverview>{clickedResult.overview}</BigOverview>
                      <BigDetail>
                        <span style={{ textTransform: "capitalize" }}>
                          Type: {clickedResult.media_type}
                        </span>
                        <span>
                          Release date:{" "}
                          {clickedResult.release_date ||
                            clickedResult.fist_air_date}
                        </span>
                        <span>
                          Rating:{" "}
                          <FontAwesomeIcon
                            icon={faStar}
                            style={{
                              color: "gold",
                              fontSize: "20px",
                              paddingLeft: "3px",
                              paddingRight: "5px",
                            }}
                          />
                          {clickedResult.vote_average}
                        </span>
                        <span>Vote count: {clickedResult.vote_count}</span>
                      </BigDetail>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Search;
